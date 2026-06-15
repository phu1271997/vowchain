import pytest
import json
from unittest.mock import patch, MagicMock
from test_create_agreement import json_to_dict

@patch("genlayer.gl.nondet.exec_prompt")
@patch("genlayer.gl.nondet.web.render")
@patch("time.time")
def test_dispute_proposal_flow(mock_time, mock_render, mock_prompt, core_contract, accounts):
    mock_time.return_value = 100000.0
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
    core_contract.submit_evidence(agreement_id, "Evidence A", "income", sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Evidence B", "other", sender=partner_b)
    
    mock_llm_json = {"split_a": 50, "split_b": 50, "factors_considered": "A", "reasoning": "B", "confidence": "medium"}
    mock_prompt.return_value = json.dumps(mock_llm_json)
    
    # 1. Propose split 1
    core_contract.propose_split(agreement_id)
    
    # 2. Dispute split 1
    core_contract.dispute_proposal(agreement_id, sender=partner_a)
    
    res = json_to_dict(core_contract.get_agreement(agreement_id))
    assert res["status"] == "DISSOLVING"
    assert res["dispute_count"] == 1
    
    # Check cooldown: trying to dispute again immediately (if in PROPOSED status)
    # Let's propose split 2
    mock_time.return_value = 101000.0 # only advanced slightly
    core_contract.propose_split(agreement_id)
    
    # Dispute split 2 should revert due to cooldown
    with pytest.raises(Exception) as exc:
        core_contract.dispute_proposal(agreement_id, sender=partner_b)
    assert "Dispute cooldown active" in str(exc.value)
    
    # Advance time past 24h (86400 seconds)
    mock_time.return_value = 200000.0
    core_contract.dispute_proposal(agreement_id, sender=partner_b)
    
    res = json_to_dict(core_contract.get_agreement(agreement_id))
    assert res["status"] == "DISSOLVING"
    assert res["dispute_count"] == 2

@patch("genlayer.gl.nondet.exec_prompt")
@patch("genlayer.gl.nondet.web.render")
@patch("time.time")
def test_deadlock_transition_and_resolution(mock_time, mock_render, mock_prompt, core_contract, accounts):
    # Setup initial time
    mock_time.return_value = 100000.0
    partner_a = accounts[1]
    partner_b = accounts[2]
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        "Terms",
        sender=partner_a,
        value=6000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=4000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Evidence A", "income", sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Evidence B", "other", sender=partner_b)
    
    mock_llm_json = {"split_a": 50, "split_b": 50, "factors_considered": "A", "reasoning": "B", "confidence": "medium"}
    mock_prompt.return_value = json.dumps(mock_llm_json)
    
    # Propose 1 and dispute
    core_contract.propose_split(agreement_id)
    core_contract.dispute_proposal(agreement_id, sender=partner_a)
    
    # Propose 2 and dispute (with time advanced)
    mock_time.return_value = 200000.0
    core_contract.propose_split(agreement_id)
    core_contract.dispute_proposal(agreement_id, sender=partner_b)
    
    # Propose 3
    mock_time.return_value = 300000.0
    core_contract.propose_split(agreement_id)
    
    # Third dispute transitions to DEADLOCK
    core_contract.dispute_proposal(agreement_id, sender=partner_a)
    
    res = json_to_dict(core_contract.get_agreement(agreement_id))
    assert res["status"] == "DEADLOCK"
    
    # Trying to propose split again should fail in DEADLOCK
    with pytest.raises(Exception) as exc:
        core_contract.propose_split(agreement_id)
    assert "Cannot generate more AI proposals" in str(exc.value)
    
    # Settle deadlock mutually (50/50 split)
    core_contract.settle_deadlock(agreement_id, sender=partner_a)
    core_contract.settle_deadlock(agreement_id, sender=partner_b)
    
    res = json_to_dict(core_contract.get_agreement(agreement_id))
    assert res["status"] == "SETTLED"
    assert res["pool"] == 0 # Cleared and sent to Treasury

def test_settle_deadlock_not_deadlocked(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        "Terms",
        sender=partner_a,
        value=5000
    )
    
    with pytest.raises(Exception) as exc:
        core_contract.settle_deadlock(agreement_id, sender=partner_a)
    assert "Agreement is not in DEADLOCK status" in str(exc.value)
