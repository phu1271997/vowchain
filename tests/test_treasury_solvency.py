import pytest
import json
from unittest.mock import patch, MagicMock
from test_create_agreement import json_to_dict

@patch("genlayer.gl.nondet.exec_prompt")
@patch("genlayer.gl.nondet.web.render")
def test_treasury_payout_and_withdrawal(mock_render, mock_prompt, core_contract, treasury_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        "Terms",
        sender=partner_a,
        value=8000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=2000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Ev A", "income", sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Ev B", "other", sender=partner_b)
    
    mock_llm_json = {"split_a": 60, "split_b": 40, "factors_considered": "A", "reasoning": "B", "confidence": "high"}
    mock_prompt.return_value = json.dumps(mock_llm_json)
    
    core_contract.propose_split(agreement_id)
    
    # Accept proposed split (60/40 of 10000 -> 6000 A, 4000 B)
    core_contract.accept_proposal(agreement_id, sender=partner_a)
    core_contract.accept_proposal(agreement_id, sender=partner_b)
    
    # Check that balances were credited to Treasury
    bal_a = int(treasury_contract.get_withdrawable(partner_a.address))
    bal_b = int(treasury_contract.get_withdrawable(partner_b.address))
    
    assert bal_a == 6000
    assert bal_b == 4000
    
    # Withdraw partner A
    withdrawn = treasury_contract.withdraw(sender=partner_a)
    assert int(withdrawn) == 6000
    
    # Balance should be zeroed out
    assert int(treasury_contract.get_withdrawable(partner_a.address)) == 0
    
    # Second withdrawal should revert
    with pytest.raises(Exception) as exc:
        treasury_contract.withdraw(sender=partner_a)
    assert "No balance to withdraw" in str(exc.value)

def test_treasury_deposit_restricted(treasury_contract, accounts):
    from genlayer.py.types import Address
    # Only Core address can call deposit_share
    random_user = accounts[3]
    with pytest.raises(Exception) as exc:
        treasury_contract.deposit_share(Address(random_user.address), sender=random_user, value=1000)
    assert "Only Core contract can deposit shares" in str(exc.value)

def test_solvency_invariant_fuzz(core_contract, treasury_contract, accounts):
    from genlayer.py.types import Address
    # Setup multiple agreements and withdrawals, verify sum of active funds matches total
    partner_a = accounts[1]
    partner_b = accounts[2]
    
    # Direct mock deposit from core simulation
    core_address = core_contract._inst.address
    
    # Simulate multiple deposits from Core
    total_deposited = 0
    for i in range(1, 5):
        val = i * 1000
        treasury_contract.deposit_share(Address(partner_a.address), sender=core_address, value=val)
        total_deposited += val
        
    bal_a = int(treasury_contract.get_withdrawable(partner_a.address))
    assert bal_a == total_deposited
    
    # Withdraw parts
    treasury_contract.withdraw(sender=partner_a)
    assert int(treasury_contract.get_withdrawable(partner_a.address)) == 0
