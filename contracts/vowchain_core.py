# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import time

@gl.evm.contract_interface
class ArbitratorInterface:
    class View: pass
    class Write:
        def arbitrate(self, agreement_id: str, terms: str, dep_a: u256, dep_b: u256, pool_val: u256, ev_a: str, ev_b: str, canary: str, /) -> str: ...

@gl.evm.contract_interface
class TreasuryInterface:
    class View:
        def get_withdrawable(self, addr_str: str, /) -> u256: ...
    class Write:
        def deposit_share(self, recipient: Address, /) -> None: ...

class Contract(gl.Contract):
    partner_a: TreeMap[str, Address]
    partner_b: TreeMap[str, Address]
    terms: TreeMap[str, str]
    pool: TreeMap[str, u256]
    deposit_a: TreeMap[str, u256]
    deposit_b: TreeMap[str, u256]
    status: TreeMap[str, str] # ACTIVE, DISSOLVING, ARBITRATING, PROPOSED, SETTLED, DEADLOCK
    evidence_a: TreeMap[str, str]
    evidence_b: TreeMap[str, str]
    evidence_a_category: TreeMap[str, str] # income, contribution, misconduct, asset, other
    evidence_b_category: TreeMap[str, str]
    proposed_split_a: TreeMap[str, u256]
    proposed_reasoning: TreeMap[str, str]
    accept_a: TreeMap[str, bool]
    accept_b: TreeMap[str, bool]
    proposal_count: TreeMap[str, u256] # Cap to max 3
    dispute_cooldown: TreeMap[str, u256] # timestamp block
    injection_attempts: TreeMap[str, u256]
    partner_reputation: TreeMap[Address, i256]
    agreement_counter: u256
    treasury_address: Address
    arbitrator_address: Address
    deployer: Address

    def __init__(self):
        self.agreement_counter = u256(0)
        self.treasury_address = Address("0x0000000000000000000000000000000000000000")
        self.arbitrator_address = Address("0x0000000000000000000000000000000000000000")
        self.deployer = gl.message.sender_address

    @gl.public.write
    def set_dependencies(self, treasury: Address, arbitrator: Address):
        if gl.message.sender_address != self.deployer:
            raise gl.vm.UserError("Only deployer can set dependencies")
        self.treasury_address = treasury
        self.arbitrator_address = arbitrator

    @gl.public.write.payable
    def create_agreement(self, partner_b_addr: str, separation_terms: str) -> str:
        try:
            partner_b = Address(partner_b_addr)
        except Exception:
            raise gl.vm.UserError(f"Invalid partner_b address format: {partner_b_addr}")

        ZERO = Address("0x0000000000000000000000000000000000000000")
        if partner_b == ZERO:
            raise gl.vm.UserError("Partner B address cannot be zero")
        if partner_b == gl.message.sender_address:
            raise gl.vm.UserError("Cannot create agreement with yourself")
        if not separation_terms.strip():
            raise gl.vm.UserError("Separation terms cannot be empty")
        if len(separation_terms) > 5000:
            raise gl.vm.UserError("Separation terms too long (max 5000 chars)")

        self.agreement_counter += u256(1)
        agreement_id = str(self.agreement_counter)

        self.partner_a[agreement_id] = gl.message.sender_address
        self.partner_b[agreement_id] = partner_b
        self.terms[agreement_id] = separation_terms
        self.pool[agreement_id] = gl.message.value
        self.deposit_a[agreement_id] = gl.message.value
        self.deposit_b[agreement_id] = u256(0)
        self.status[agreement_id] = "ACTIVE"
        self.evidence_a[agreement_id] = ""
        self.evidence_b[agreement_id] = ""
        self.evidence_a_category[agreement_id] = ""
        self.evidence_b_category[agreement_id] = ""
        self.proposed_split_a[agreement_id] = u256(0)
        self.proposed_reasoning[agreement_id] = ""
        self.accept_a[agreement_id] = False
        self.accept_b[agreement_id] = False
        self.proposal_count[agreement_id] = u256(0)
        self.dispute_cooldown[agreement_id] = u256(0)
        self.injection_attempts[agreement_id] = u256(0)

        return agreement_id

    @gl.public.write.payable
    def join_agreement(self, agreement_id: str):
        ZERO = Address("0x0000000000000000000000000000000000000000")
        status_val = self.status.get(agreement_id, "")
        if not status_val:
            raise gl.vm.UserError("Agreement not found")
        if status_val != "ACTIVE":
            raise gl.vm.UserError("Agreement is not active")
        
        partner_b = self.partner_b.get(agreement_id, ZERO)
        if gl.message.sender_address != partner_b:
            raise gl.vm.UserError("Only designated Partner B can join this agreement")

        self.pool[agreement_id] = u256(int(self.pool.get(agreement_id, u256(0))) + int(gl.message.value))
        self.deposit_b[agreement_id] = u256(int(self.deposit_b.get(agreement_id, u256(0))) + int(gl.message.value))

    @gl.public.write
    def initiate_dissolution(self, agreement_id: str):
        ZERO = Address("0x0000000000000000000000000000000000000000")
        status_val = self.status.get(agreement_id, "")
        if not status_val:
            raise gl.vm.UserError("Agreement not found")
        if status_val != "ACTIVE":
            raise gl.vm.UserError("Agreement already dissolving or settled")

        partner_a = self.partner_a.get(agreement_id, ZERO)
        partner_b = self.partner_b.get(agreement_id, ZERO)
        if gl.message.sender_address != partner_a and gl.message.sender_address != partner_b:
            raise gl.vm.UserError("Only participating partners can dissolve the agreement")

        self.status[agreement_id] = "DISSOLVING"

    @gl.public.write
    def submit_evidence(self, agreement_id: str, evidence: str, category: str):
        ZERO = Address("0x0000000000000000000000000000000000000000")
        status_val = self.status.get(agreement_id, "")
        if status_val != "DISSOLVING":
            raise gl.vm.UserError("Agreement must be in DISSOLVING status to submit evidence")
        if len(evidence) > 10000:
            raise gl.vm.UserError("Evidence too long (max 10000 chars)")
            
        allowed_categories = ["income", "contribution", "misconduct", "asset", "other"]
        if category not in allowed_categories:
            raise gl.vm.UserError("Invalid evidence category")

        partner_a = self.partner_a.get(agreement_id, ZERO)
        partner_b = self.partner_b.get(agreement_id, ZERO)

        if gl.message.sender_address == partner_a:
            self.evidence_a[agreement_id] = evidence
            self.evidence_a_category[agreement_id] = category
        elif gl.message.sender_address == partner_b:
            self.evidence_b[agreement_id] = evidence
            self.evidence_b_category[agreement_id] = category
        else:
            raise gl.vm.UserError("Only participating partners can submit evidence")

    @gl.public.write
    def propose_split(self, agreement_id: str):
        prop_count = int(self.proposal_count.get(agreement_id, u256(0)))
        if prop_count >= 3 or self.status.get(agreement_id, "") == "DEADLOCK":
            raise gl.vm.UserError("Agreement is in DEADLOCK. Cannot generate more AI proposals.")

        status_val = self.status.get(agreement_id, "")
        if status_val != "DISSOLVING":
            raise gl.vm.UserError("Agreement status must be DISSOLVING to propose split")

        ev_a = self.evidence_a.get(agreement_id, "")
        ev_b = self.evidence_b.get(agreement_id, "")
        if not ev_a or not ev_b:
            raise gl.vm.UserError("Both partners must submit evidence before proposing a split")

        # Generate unique canary token to detect prompt injection
        canary = f"canary_token_{agreement_id}_{prop_count}_{int(time.time())}"

        terms_text = self.terms.get(agreement_id, "")
        dep_a = self.deposit_a.get(agreement_id, u256(0))
        dep_b = self.deposit_b.get(agreement_id, u256(0))
        pool_val = self.pool.get(agreement_id, u256(0))

        # Transition status to ARBITRATING to lock actions during asynchronous call
        self.status[agreement_id] = "ARBITRATING"

        # Core makes ASYNCHRONOUS EVM contract call to Arbitrator
        arbitrator = ArbitratorInterface(self.arbitrator_address)
        try:
            arbitrator.emit().arbitrate(agreement_id, terms_text, dep_a, dep_b, pool_val, ev_a, ev_b, canary)
        except Exception as e:
            # Revert state on error
            self.status[agreement_id] = "DISSOLVING"
            err_msg = str(e)
            if "canary" in err_msg.lower() or "injection" in err_msg.lower():
                attempts = int(self.injection_attempts.get(agreement_id, u256(0)))
                self.injection_attempts[agreement_id] = u256(attempts + 1)
            raise gl.vm.UserError(f"Arbitration failed: {err_msg}")

    @gl.public.write
    def callback_proposal(self, agreement_id: str, res_json: str):
        if gl.message.sender_address != self.arbitrator_address:
            raise gl.vm.UserError("Only the authorized Arbitrator can invoke callback_proposal")

        status_val = self.status.get(agreement_id, "")
        if status_val != "ARBITRATING":
            raise gl.vm.UserError("Agreement must be in ARBITRATING status to settle callback")

        result = json.loads(res_json)
        split_a = int(result["split_a"])
        
        self.proposed_split_a[agreement_id] = u256(split_a)

        reasoning_dict = {
            "factors_considered": result.get("factors_considered", ""),
            "reasoning": result.get("reasoning", ""),
            "confidence": result.get("confidence", "medium")
        }

        # Calibration: Default split to 50/50 if confidence score is low
        if result.get("confidence", "") == "low":
            self.proposed_split_a[agreement_id] = u256(50)
            reasoning_dict["reasoning"] = "[AI Low Confidence Calibration - Defaulted to 50/50] " + reasoning_dict["reasoning"]

        self.proposed_reasoning[agreement_id] = json.dumps(reasoning_dict)
        self.status[agreement_id] = "PROPOSED"
        self.accept_a[agreement_id] = False
        self.accept_b[agreement_id] = False
        
        prop_count = int(self.proposal_count.get(agreement_id, u256(0)))
        self.proposal_count[agreement_id] = u256(prop_count + 1)

    @gl.public.write
    def accept_proposal(self, agreement_id: str):
        ZERO = Address("0x0000000000000000000000000000000000000000")
        status_val = self.status.get(agreement_id, "")
        if status_val != "PROPOSED":
            raise gl.vm.UserError("Agreement split must be in PROPOSED state to accept")

        partner_a = self.partner_a.get(agreement_id, ZERO)
        partner_b = self.partner_b.get(agreement_id, ZERO)

        is_a = (gl.message.sender_address == partner_a)
        is_b = (gl.message.sender_address == partner_b)

        if not is_a and not is_b:
            raise gl.vm.UserError("Only participating partners can accept the proposal")

        if is_a:
            self.accept_a[agreement_id] = True
        if is_b:
            self.accept_b[agreement_id] = True

        if self.accept_a.get(agreement_id, False) and self.accept_b.get(agreement_id, False):
            self.status[agreement_id] = "SETTLED"

            split_a = int(self.proposed_split_a.get(agreement_id, u256(50)))
            total_pool = int(self.pool.get(agreement_id, u256(0)))

            share_a = (total_pool * split_a) // 100
            share_b = total_pool - share_a

            # Zero out pool balance to protect against double spend re-entrancy
            self.pool[agreement_id] = u256(0)

            # Route payouts to Treasury
            treasury = TreasuryInterface(self.treasury_address)
            if share_a > 0:
                treasury.emit(value=u256(share_a)).deposit_share(partner_a)
            if share_b > 0:
                treasury.emit(value=u256(share_b)).deposit_share(partner_b)

            # Reputation reward logic
            prop_count = int(self.proposal_count.get(agreement_id, u256(0)))
            rep_bonus = 2 if prop_count == 1 else 1
            
            self.partner_reputation[partner_a] = i256(int(self.partner_reputation.get(partner_a, i256(0))) + rep_bonus)
            self.partner_reputation[partner_b] = i256(int(self.partner_reputation.get(partner_b, i256(0))) + rep_bonus)

    @gl.public.write
    def dispute_proposal(self, agreement_id: str):
        ZERO = Address("0x0000000000000000000000000000000000000000")
        status_val = self.status.get(agreement_id, "")
        if status_val != "PROPOSED":
            raise gl.vm.UserError("Only proposed splits can be disputed")

        partner_a = self.partner_a.get(agreement_id, ZERO)
        partner_b = self.partner_b.get(agreement_id, ZERO)
        if gl.message.sender_address != partner_a and gl.message.sender_address != partner_b:
            raise gl.vm.UserError("Only participating partners can dispute the proposal")

        # Cooldown guard: 24h block timestamp cooldown
        cooldown = int(self.dispute_cooldown.get(agreement_id, u256(0)))
        now = int(time.time())
        if now < cooldown:
            raise gl.vm.UserError(f"Dispute cooldown active. Please wait {cooldown - now} seconds.")

        # Set 24 hour cooldown
        self.dispute_cooldown[agreement_id] = u256(now + 86400)

        # Deduct reputation from disputing party
        current_rep = int(self.partner_reputation.get(gl.message.sender_address, i256(0)))
        self.partner_reputation[gl.message.sender_address] = i256(current_rep - 1)

        prop_count = int(self.proposal_count.get(agreement_id, u256(0)))
        if prop_count >= 3:
            # Transitions to deadlock state
            self.status[agreement_id] = "DEADLOCK"
        else:
            self.status[agreement_id] = "DISSOLVING"
            self.accept_a[agreement_id] = False
            self.accept_b[agreement_id] = False

    @gl.public.write
    def settle_deadlock(self, agreement_id: str):
        ZERO = Address("0x0000000000000000000000000000000000000000")
        status_val = self.status.get(agreement_id, "")
        if status_val != "DEADLOCK":
            raise gl.vm.UserError("Agreement is not in DEADLOCK status")

        partner_a = self.partner_a.get(agreement_id, ZERO)
        partner_b = self.partner_b.get(agreement_id, ZERO)
        if gl.message.sender_address != partner_a and gl.message.sender_address != partner_b:
            raise gl.vm.UserError("Only participating partners can settle deadlock")

        if gl.message.sender_address == partner_a:
            self.accept_a[agreement_id] = True
        if gl.message.sender_address == partner_b:
            self.accept_b[agreement_id] = True

        if self.accept_a.get(agreement_id, False) and self.accept_b.get(agreement_id, False):
            self.status[agreement_id] = "SETTLED"

            total_pool = int(self.pool.get(agreement_id, u256(0)))
            share_a = total_pool // 2
            share_b = total_pool - share_a

            self.pool[agreement_id] = u256(0)

            # Split evenly
            treasury = TreasuryInterface(self.treasury_address)
            if share_a > 0:
                treasury.emit(value=u256(share_a)).deposit_share(partner_a)
            if share_b > 0:
                treasury.emit(value=u256(share_b)).deposit_share(partner_b)

    @gl.public.view
    def get_agreement_counter(self) -> u256:
        return self.agreement_counter

    @gl.public.view
    def get_agreement(self, agreement_id: str) -> str:
        ZERO = Address("0x0000000000000000000000000000000000000000")
        status_val = self.status.get(agreement_id, "")
        if not status_val:
            raise gl.vm.UserError("Agreement not found")

        return json.dumps({
            "agreement_id": agreement_id,
            "partner_a": str(self.partner_a.get(agreement_id, ZERO)),
            "partner_b": str(self.partner_b.get(agreement_id, ZERO)),
            "terms": self.terms.get(agreement_id, ""),
            "pool": int(self.pool.get(agreement_id, u256(0))),
            "deposit_a": int(self.deposit_a.get(agreement_id, u256(0))),
            "deposit_b": int(self.deposit_b.get(agreement_id, u256(0))),
            "status": status_val,
            "evidence_a": self.evidence_a.get(agreement_id, ""),
            "evidence_b": self.evidence_b.get(agreement_id, ""),
            "evidence_a_category": self.evidence_a_category.get(agreement_id, ""),
            "evidence_b_category": self.evidence_b_category.get(agreement_id, ""),
            "dispute_count": int(self.proposal_count.get(agreement_id, u256(0))),
            "dispute_cooldown": int(self.dispute_cooldown.get(agreement_id, u256(0))),
            "injection_attempts": int(self.injection_attempts.get(agreement_id, u256(0)))
        })

    @gl.public.view
    def get_proposal(self, agreement_id: str) -> str:
        status_val = self.status.get(agreement_id, "")
        if not status_val:
            raise gl.vm.UserError("Agreement not found")
        if status_val not in ["PROPOSED", "SETTLED"]:
            raise gl.vm.UserError("No proposal exists for this agreement")

        reasoning_str = self.proposed_reasoning.get(agreement_id, "")
        reasoning_data = {}
        if reasoning_str:
            try:
                reasoning_data = json.loads(reasoning_str)
            except Exception:
                reasoning_data = {"raw_reasoning": reasoning_str}

        split_a = int(self.proposed_split_a.get(agreement_id, u256(50)))

        return json.dumps({
            "agreement_id": agreement_id,
            "proposed_split_a": split_a,
            "proposed_split_b": 100 - split_a,
            "reasoning": reasoning_data,
            "accept_a": bool(self.accept_a.get(agreement_id, False)),
            "accept_b": bool(self.accept_b.get(agreement_id, False))
        })

    @gl.public.view
    def get_reputation(self, address_str: str) -> i256:
        try:
            addr = Address(address_str)
        except Exception:
            raise gl.vm.UserError("Invalid address format")
        return self.partner_reputation.get(addr, i256(0))
