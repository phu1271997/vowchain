import pytest
from test_create_agreement import json_to_dict

def test_join_agreement_success(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "We agree to split assets 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    
    # Partner B joins and deposits 3000
    core_contract.join_agreement(
        agreement_id,
        sender=partner_b,
        value=3000
    )
    
    res = json_to_dict(core_contract.get_agreement(agreement_id))
    assert res["pool"] == 8000
    assert res["deposit_b"] == 3000
    assert res["status"] == "ACTIVE"

def test_join_non_existent_agreement(core_contract, accounts):
    partner_b = accounts[2]
    with pytest.raises(Exception) as exc:
        core_contract.join_agreement(
            "999",
            sender=partner_b,
            value=3000
        )
    assert "Agreement not found" in str(exc.value)

def test_join_agreement_unauthorized(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    unauthorized = accounts[3]
    terms = "We agree to split assets 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    
    with pytest.raises(Exception) as exc:
        core_contract.join_agreement(
            agreement_id,
            sender=unauthorized,
            value=3000
        )
    assert "Only designated Partner B can join" in str(exc.value)

def test_join_agreement_not_active(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "We agree to split assets 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    
    with pytest.raises(Exception) as exc:
        core_contract.join_agreement(
            agreement_id,
            sender=partner_b,
            value=3000
        )
    assert "Agreement is not active" in str(exc.value)

def test_join_agreement_multiple_topups(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "We agree to split assets 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    
    # First join
    core_contract.join_agreement(
        agreement_id,
        sender=partner_b,
        value=2000
    )
    
    # Second top-up (since status is still ACTIVE)
    core_contract.join_agreement(
        agreement_id,
        sender=partner_b,
        value=1500
    )
    
    res = json_to_dict(core_contract.get_agreement(agreement_id))
    assert res["pool"] == 8500
    assert res["deposit_b"] == 3500
