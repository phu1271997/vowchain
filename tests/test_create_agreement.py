import pytest

def test_create_agreement_success(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "We agree to split assets 50/50."
    deposit = 10_000_000_000_000_000 # 0.01 GEN
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=deposit
    )
    
    assert agreement_id == "1"
    assert int(core_contract.get_agreement_counter()) == 1
    
    # Retrieve details
    res = json_to_dict(core_contract.get_agreement("1"))
    assert res["partner_a"] == partner_a.address
    assert res["partner_b"] == partner_b.address
    assert res["terms"] == terms
    assert res["pool"] == deposit
    assert res["deposit_a"] == deposit
    assert res["deposit_b"] == 0
    assert res["status"] == "ACTIVE"

def test_create_agreement_invalid_address(core_contract, accounts):
    partner_a = accounts[1]
    terms = "We agree to split assets 50/50."
    
    with pytest.raises(Exception) as exc:
        core_contract.create_agreement(
            "invalid_eth_address",
            terms,
            sender=partner_a
        )
    assert "Invalid partner_b address format" in str(exc.value)

def test_create_agreement_zero_address(core_contract, accounts):
    partner_a = accounts[1]
    terms = "We agree to split assets 50/50."
    zero_addr = "0x0000000000000000000000000000000000000000"
    
    with pytest.raises(Exception) as exc:
        core_contract.create_agreement(
            zero_addr,
            terms,
            sender=partner_a
        )
    assert "Partner B address cannot be zero" in str(exc.value)

def test_create_agreement_self_deal(core_contract, accounts):
    partner_a = accounts[1]
    terms = "We agree to split assets 50/50."
    
    with pytest.raises(Exception) as exc:
        core_contract.create_agreement(
            partner_a.address,
            terms,
            sender=partner_a
        )
    assert "Cannot create agreement with yourself" in str(exc.value)

def test_create_agreement_empty_terms(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    
    with pytest.raises(Exception) as exc:
        core_contract.create_agreement(
            partner_b.address,
            "   ",
            sender=partner_a
        )
    assert "Separation terms cannot be empty" in str(exc.value)

def test_create_agreement_terms_too_long(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    huge_terms = "A" * 5001
    
    with pytest.raises(Exception) as exc:
        core_contract.create_agreement(
            partner_b.address,
            huge_terms,
            sender=partner_a
        )
    assert "Separation terms too long" in str(exc.value)

# Utility helper
def json_to_dict(json_str: str) -> dict:
    import json
    return json.loads(json_str)
