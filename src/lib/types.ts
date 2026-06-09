export interface Agreement {
  agreement_id: string;
  partner_a: string;
  partner_b: string;
  terms: string;
  pool: bigint;
  deposit_a: bigint;
  deposit_b: bigint;
  status: "ACTIVE" | "DISSOLVING" | "PROPOSED" | "SETTLED" | "DEADLOCK" | string;
  evidence_a: string;
  evidence_b: string;
  evidence_a_category: string;
  evidence_b_category: string;
  dispute_count: number;
  dispute_cooldown: number;
}

export interface Proposal {
  agreement_id: string;
  proposed_split_a: number;
  proposed_split_b: number;
  reasoning: {
    factors_considered?: string;
    reasoning?: string;
    confidence?: string;
    raw_reasoning?: string;
  };
  accept_a: boolean;
  accept_b: boolean;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  partnerAName: string;
  partnerAAddr: string;
  partnerBName: string;
  partnerBAddr: string;
  terms: string;
  depositA: string;
  depositB: string;
  evidenceA: string;
  evidenceACategory: string;
  evidenceB: string;
  evidenceBCategory: string;
  expectedSplit: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface LocalHistoryItem {
  agreementId: string;
  role: "partner_a" | "partner_b" | "observer";
  addedAt: number;
}
