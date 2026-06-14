import pytest
from test_create_agreement import json_to_dict

def test_initiate_dissolution_success(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "We agree to split assets 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    
    core_contract.join_agreement(agreement_id, sender=partner_b, value=5000)
    
    # Partner B initiates dissolution
    core_contract.initiate_dissolution(agreement_id, sender=partner_b)
    
    res = json_to_dict(core_contract.get_agreement(agreement_id))
    assert res["status"] == "DISSOLVING"

def test_initiate_dissolution_unauthorized(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    unauthorized = accounts[3]
    terms = "We agree to split 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    
    with pytest.raises(Exception) as exc:
        core_contract.initiate_dissolution(agreement_id, sender=unauthorized)
    assert "Only participating partners can dissolve" in str(exc.value)

def test_submit_evidence_success(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "We agree to split 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    
    core_contract.join_agreement(agreement_id, sender=partner_b, value=5000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    
    # Submit evidence for Partner A
    core_contract.submit_evidence(
        agreement_id,
        "I earned the primary income for our household.",
        "income",
        sender=partner_a
    )
    
    # Submit evidence for Partner B
    core_contract.submit_evidence(
        agreement_id,
        "I cared for our child and managed the household.",
        "contribution",
        sender=partner_b
    )
    
    res = json_to_dict(core_contract.get_agreement(agreement_id))
    assert res["evidence_a"] == "I earned the primary income for our household."
    assert res["evidence_a_category"] == "income"
    assert res["evidence_b"] == "I cared for our child and managed the household."
    assert res["evidence_b_category"] == "contribution"

def test_submit_evidence_not_dissolving(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "We agree to split 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    
    with pytest.raises(Exception) as exc:
        core_contract.submit_evidence(
            agreement_id,
            "I earned primary income.",
            "income",
            sender=partner_a
        )
    assert "Agreement must be in DISSOLVING status" in str(exc.value)

def test_submit_evidence_invalid_category(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "We agree to split 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=5000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    
    with pytest.raises(Exception) as exc:
        core_contract.submit_evidence(
            agreement_id,
            "I paid for everything.",
            "invalid_cat_name",
            sender=partner_a
        )
    assert "Invalid evidence category" in str(exc.value)

def test_submit_evidence_too_long(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "We agree to split 50/50."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=5000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    
    huge_evidence = "Evidence" * 2000 # 16000 chars
    
    with pytest.raises(Exception) as exc:
        core_contract.submit_evidence(
            agreement_id,
            huge_evidence,
            "other",
            sender=partner_a
        )
    assert "Evidence too long" in str(exc.value)
