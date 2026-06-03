# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

@gl.evm.contract_interface
class _Recipient:
    """
    Interface definition for sending GEN (native tokens) to an EOA or EVM address.
    """
    class View: pass
    class Write: pass

class Contract(gl.Contract):
    core_address: Address
    deployer: Address
    withdrawable_balance: TreeMap[Address, u256]

    def __init__(self):
        self.core_address = Address("0x0000000000000000000000000000000000000000")
        self.deployer = gl.message.sender_address

    @gl.public.write
    def set_core_address(self, core: Address):
        if gl.message.sender_address != self.deployer:
            raise gl.vm.UserError("Only deployer can set Core address")
        ZERO = Address("0x0000000000000000000000000000000000000000")
        if self.core_address != ZERO:
            raise gl.vm.UserError("Core address already set")
        self.core_address = core

    @gl.public.write.payable
    def deposit_share(self, recipient: Address):
        if gl.message.sender_address != self.core_address:
            raise gl.vm.UserError("Only Core contract can deposit shares")
        
        amount = gl.message.value
        if int(amount) == 0:
            return
            
        current = self.withdrawable_balance.get(recipient, u256(0))
        self.withdrawable_balance[recipient] = u256(int(current) + int(amount))

    @gl.public.write
    def withdraw(self) -> u256:
        sender = gl.message.sender_address
        amount = self.withdrawable_balance.get(sender, u256(0))
        
        if int(amount) == 0:
            raise gl.vm.UserError("No balance to withdraw")
            
        # Zero balance first to prevent re-entrancy
        self.withdrawable_balance[sender] = u256(0)
        
        # Perform value transfer to the sender
        _Recipient(sender).emit_transfer(value=amount)
        return amount

    @gl.public.view
    def get_withdrawable(self, addr_str: str) -> u256:
        try:
            addr = Address(addr_str)
        except Exception:
            raise gl.vm.UserError("Invalid address format")
        return self.withdrawable_balance.get(addr, u256(0))
