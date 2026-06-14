import pytest
import sys
from pathlib import Path

def clear_known_contracts():
    for name, module in list(sys.modules.items()):
        if "genlayer" in name:
            if hasattr(module, "__known_contract__"):
                setattr(module, "__known_contract__", None)

@pytest.fixture(autouse=True)
def patch_vm_context(direct_vm):
    vm_class = type(direct_vm)
    original_refresh = vm_class._refresh_gl_message

    def patched_refresh(self):
        original_refresh(self)
        if 'genlayer.gl' in sys.modules:
            gl = sys.modules['genlayer.gl']
            if hasattr(gl, 'message_raw') and gl.message_raw is not None:
                if hasattr(self, '_datetime') and self._datetime is not None:
                    gl.message_raw['datetime'] = self._datetime
                if hasattr(self, '_value') and self._value is not None:
                    gl.message_raw['value'] = self._value

    vm_class._refresh_gl_message = patched_refresh

    # Patch get_store_slot to isolate contract storage for slot 0
    original_get_store_slot = direct_vm._storage.get_store_slot
    def patched_get_store_slot(slot_id: bytes):
        if slot_id == b'\x00' * 32:
            addr = getattr(direct_vm, "_contract_address", None)
            if addr:
                return original_get_store_slot(addr.ljust(32, b'\x00'))
        return original_get_store_slot(slot_id)
    
    direct_vm._storage.get_store_slot = patched_get_store_slot

    yield

    vm_class._refresh_gl_message = original_refresh
    direct_vm._storage.get_store_slot = original_get_store_slot

@pytest.fixture
def core_contract(direct_deploy, direct_vm, accounts):
    """Deploys all three modular contracts (Treasury, Arbitrator, Core) and links them."""
    from gltest.direct.sdk_loader import setup_sdk_paths
    setup_sdk_paths(Path("contracts/vowchain_core.py"), None)
    from genlayer.py.types import Address
    
    deployer = accounts[0]
    direct_vm.sender = Address(deployer.address)
    
    # 1. Deploy Treasury
    clear_known_contracts()
    treasury_instance = direct_deploy("contracts/vowchain_treasury.py")
    
    # 2. Deploy Arbitrator
    clear_known_contracts()
    arbitrator_instance = direct_deploy("contracts/vowchain_arbitrator.py")
    
    # 3. Deploy Core
    clear_known_contracts()
    core_instance = direct_deploy("contracts/vowchain_core.py")
    
    # 4. Link Core and Arbitrator/Treasury dependencies
    core_instance.set_dependencies(
        treasury_instance.address,
        arbitrator_instance.address
    )
    
    # 5. Set Core address on Treasury
    treasury_instance.set_core_address(core_instance.address)
    
    # Setup mock interfaces for cross-contract calls inside the direct VM environment
    core_module = sys.modules["_contract_vowchain_core"]
    arbitrator_module = sys.modules["_contract_vowchain_arbitrator"]

    class MockTreasuryInterface:
        def __init__(self, address):
            self.address = address
            self.value = 0
        def emit(self, value=0, on='finalized'):
            self.value = value
            return self
        def deposit_share(self, recipient):
            orig_sender, orig_val = direct_vm.sender, direct_vm.value
            try:
                direct_vm.sender = core_instance.address
                direct_vm.value = self.value
                treasury_instance.deposit_share(recipient)
            finally:
                direct_vm.sender, direct_vm.value = orig_sender, orig_val

    class MockArbitratorInterface:
        def __init__(self, address):
            self.address = address
            self.value = 0
        def emit(self, value=0, on='finalized'):
            self.value = value
            return self
        def arbitrate(self, agreement_id, terms, dep_a, dep_b, pool_val, ev_a, ev_b, canary):
            orig_sender, orig_val = direct_vm.sender, direct_vm.value
            try:
                direct_vm.sender = core_instance.address
                direct_vm.value = self.value
                return arbitrator_instance.arbitrate(agreement_id, terms, dep_a, dep_b, pool_val, ev_a, ev_b, canary)
            finally:
                direct_vm.sender, direct_vm.value = orig_sender, orig_val

    class MockCoreInterface:
        def __init__(self, address):
            self.address = address
            self.value = 0
        def emit(self, value=0, on='finalized'):
            self.value = value
            return self
        def callback_proposal(self, agreement_id, res_json):
            orig_sender, orig_val = direct_vm.sender, direct_vm.value
            try:
                direct_vm.sender = arbitrator_instance.address
                direct_vm.value = self.value
                core_instance.callback_proposal(agreement_id, res_json)
            finally:
                direct_vm.sender, direct_vm.value = orig_sender, orig_val

    core_module.TreasuryInterface = MockTreasuryInterface
    core_module.ArbitratorInterface = MockArbitratorInterface
    arbitrator_module.CoreInterface = MockCoreInterface
    
    class DirectContractWrapper:
        def __init__(self, inst, vm, treasury, arbitrator):
            self._inst = inst
            self._vm = vm
            self._treasury = treasury
            self._arbitrator = arbitrator
            
        def __getattr__(self, name):
            attr = getattr(self._inst, name)
            if callable(attr):
                def _wrapped(*args, **kwargs):
                    sender = kwargs.pop('sender', None)
                    value = kwargs.pop('value', None)
                    
                    old_sender = self._vm.sender
                    old_value = self._vm.value
                    
                    if sender is not None:
                        from genlayer.py.types import Address
                        if hasattr(sender, 'address'):
                            sender = Address(sender.address)
                        elif isinstance(sender, str):
                            sender = Address(sender)
                        self._vm.sender = sender
                    if value is not None:
                        self._vm.value = value
                        
                    try:
                        return attr(*args, **kwargs)
                    finally:
                        if sender is not None:
                            self._vm.sender = old_sender
                        if value is not None:
                            self._vm.value = old_value
                return _wrapped
            return attr
            
    return DirectContractWrapper(core_instance, direct_vm, treasury_instance, arbitrator_instance)

@pytest.fixture
def treasury_contract(core_contract):
    """Exposes a wrapped treasury contract to send transactions mockable via kwargs."""
    class TreasuryWrapper:
        def __init__(self, inst, vm):
            self._inst = inst
            self._vm = vm
            
        def __getattr__(self, name):
            attr = getattr(self._inst, name)
            if callable(attr):
                def _wrapped(*args, **kwargs):
                    sender = kwargs.pop('sender', None)
                    value = kwargs.pop('value', None)
                    
                    old_sender = self._vm.sender
                    old_value = self._vm.value
                    
                    if sender is not None:
                        from genlayer.py.types import Address
                        if hasattr(sender, 'address'):
                            sender = Address(sender.address)
                        elif isinstance(sender, str):
                            sender = Address(sender)
                        self._vm.sender = sender
                    if value is not None:
                        self._vm.value = value
                        
                    try:
                        return attr(*args, **kwargs)
                    finally:
                        if sender is not None:
                            self._vm.sender = old_sender
                        if value is not None:
                            self._vm.value = old_value
                return _wrapped
            return attr
            
    return TreasuryWrapper(core_contract._treasury, core_contract._vm)
