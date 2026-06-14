import pytest
import json
from unittest.mock import patch, MagicMock
from test_create_agreement import json_to_dict

@patch("genlayer.gl.nondet.exec_prompt")
@patch("genlayer.gl.nondet.web.render")
def test_propose_split_success(mock_render, mock_prompt, core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "Split fairly according to financial contribution."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=8000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=2000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    
    core_contract.submit_evidence(agreement_id, "I deposited 80%", "income", sender=partner_a)
    core_contract.submit_evidence(agreement_id, "I did household work", "contribution", sender=partner_b)
    
    # Mock render and prompt responses
    mock_render_res = MagicMock()
    mock_render_res.body = b"Mock rendered HTML"
    mock_render.return_value = mock_render_res
    
    mock_llm_json = {
        "split_a": 60,
        "split_b": 40,
        "factors_considered": "Partner A deposited more. Partner B did homemaking.",
        "reasoning": "We propose a 60/40 split.",
        "confidence": "medium"
    }
    mock_prompt.return_value = json.dumps(mock_llm_json)
    
    # Run split proposal
    core_contract.propose_split(agreement_id)
    res = json_to_dict(core_contract.get_proposal(agreement_id))
    
    assert res["proposed_split_a"] == 60
    assert res["proposed_split_b"] == 40
    
    # Verify core contract state
    agreement = json_to_dict(core_contract.get_agreement(agreement_id))
    assert agreement["status"] == "PROPOSED"
    assert agreement["dispute_count"] == 1
    
    proposal = json_to_dict(core_contract.get_proposal(agreement_id))
    assert proposal["proposed_split_a"] == 60
    assert proposal["proposed_split_b"] == 40
    assert proposal["reasoning"]["confidence"] == "medium"

def test_propose_split_not_dissolving(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "Split fairly."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    
    with pytest.raises(Exception) as exc:
        core_contract.propose_split(agreement_id)
    assert "Agreement status must be DISSOLVING" in str(exc.value)

def test_propose_split_missing_evidence(core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    terms = "Split fairly."
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        terms,
        sender=partner_a,
        value=5000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=5000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    
    # Only Partner A submits evidence
    core_contract.submit_evidence(agreement_id, "Evidence A", "income", sender=partner_a)
    
    with pytest.raises(Exception) as exc:
        core_contract.propose_split(agreement_id)
    assert "Both partners must submit evidence" in str(exc.value)

@patch("genlayer.gl.nondet.exec_prompt")
@patch("genlayer.gl.nondet.web.render")
def test_propose_split_low_confidence_calibration(mock_render, mock_prompt, core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        "Terms",
        sender=partner_a,
        value=1000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=1000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Evidence A", "income", sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Evidence B", "other", sender=partner_b)
    
    mock_llm_json = {
        "split_a": 90,
        "split_b": 10,
        "factors_considered": "Very little evidence to verify.",
        "reasoning": "Unclear details.",
        "confidence": "low"
    }
    mock_prompt.return_value = json.dumps(mock_llm_json)
    
    core_contract.propose_split(agreement_id)
    res = json_to_dict(core_contract.get_proposal(agreement_id))
    
    # Assert calibration forced split to 50/50
    assert res["proposed_split_a"] == 50
    assert res["proposed_split_b"] == 50

@patch("genlayer.gl.nondet.exec_prompt")
@patch("genlayer.gl.nondet.web.render")
def test_propose_split_malformed_json_fallback(mock_render, mock_prompt, core_contract, accounts):
    partner_a = accounts[1]
    partner_b = accounts[2]
    
    agreement_id = core_contract.create_agreement(
        partner_b.address,
        "Terms",
        sender=partner_a,
        value=1000
    )
    core_contract.join_agreement(agreement_id, sender=partner_b, value=1000)
    core_contract.initiate_dissolution(agreement_id, sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Evidence A", "income", sender=partner_a)
    core_contract.submit_evidence(agreement_id, "Evidence B", "other", sender=partner_b)
    
    # Mock malformed LLM response
    mock_prompt.return_value = "This is not JSON: split_a: 70, split_b: 30"
    
    with pytest.raises(Exception) as exc:
        core_contract.propose_split(agreement_id)
    assert "No JSON object found" in str(exc.value) or "Arbitration failed" in str(exc.value)
