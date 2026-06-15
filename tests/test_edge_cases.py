import pytest
import json
from unittest.mock import patch, MagicMock
from test_create_agreement import json_to_dict

@patch("genlayer.gl.nondet.exec_prompt")
@patch("genlayer.gl.nondet.web.render")
def test_reputation_system(mock_render, mock_prompt, core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    
    # Initial reputation is 0
    rep_a = int(core_contract.get_reputation(partner_a.address))
    rep_b = int(core_contract.get_reputation(partner_b.address))
    assert rep_a == 0
    assert rep_b == 0
    
    # 1. Create and Join
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        "Terms",
        sender=partner_a,
        value=5000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=5000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Ev A", "income", sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Ev B", "other", sender=partner_b)
    
    mock_llm_json = {"split_a": 50, "split_b": 50, "factors_considered": "A", "reasoning": "B", "confidence": "high"}
    mock_prompt.return_value = json.dumps(mock_llm_json)
    
    core_contract.propose_split(agreement_id)
    
    # Accept proposed split immediately (amicable settlement -> +2 reputation)
    core_contract.accept_proposal(agreement_id, sender=partner_a)
    core_contract.accept_proposal(agreement_id, sender=partner_b)
    
    rep_a_new = int(core_contract.get_reputation(partner_a.address))
    rep_b_new = int(core_contract.get_reputation(partner_b.address))
    assert rep_a_new == 2
    assert rep_b_new == 2

def test_set_dependencies_unauthorized(core_contract, accounts):
    from genlayer.py.types import Address
    unauthorized = accounts[3]
    with pytest.raises(Exception) as exc:
        core_contract.set_dependencies(
            Address(unauthorized.address),
            Address(unauthorized.address),
            sender=unauthorized
        )
    assert "Only deployer can set dependencies" in str(exc.value)

def test_reputation_deduction_on_dispute(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        "Terms",
        sender=partner_a,
        value=5000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=5000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Ev A", "income", sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Ev B", "other", sender=partner_b)
    
    with patch("genlayer.gl.nondet.exec_prompt") as mock_prompt, patch("genlayer.gl.nondet.web.render") as mock_render:
        mock_llm_json = {"split_a": 50, "split_b": 50, "factors_considered": "A", "reasoning": "B", "confidence": "high"}
        mock_prompt.return_value = json.dumps(mock_llm_json)
        core_contract.propose_split(agreement_id)
        
        # Partner A disputes -> loses 1 reputation point (-1)
        core_contract.dispute_proposal(agreement_id, sender=partner_a)
        
    rep_a = int(core_contract.get_reputation(partner_a.address))
    assert rep_a == -1
