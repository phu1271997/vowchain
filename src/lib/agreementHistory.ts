import type { LocalHistoryItem } from "./types";

const HISTORY_KEY = "vowchain_agreement_history_v2";

export function getAgreementHistory(): LocalHistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAgreementToHistory(agreementId: string, roleOverride?: "partner_a" | "partner_b") {
  if (typeof window === "undefined") return;
  const history = getAgreementHistory();
  
  // Check if already in history
  if (history.some((h) => h.agreementId === agreementId)) return;
  
  let role: "partner_a" | "partner_b" | "observer" = "observer";
  if (roleOverride) {
    role = roleOverride;
  }
  
  const newItem: LocalHistoryItem = {
    agreementId,
    role,
    addedAt: Date.now(),
  };
  
  const updated = [newItem, ...history].slice(0, 50); // limit to 50 items
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function removeAgreementFromHistory(agreementId: string) {
  if (typeof window === "undefined") return;
  const history = getAgreementHistory();
  const updated = history.filter((h) => h.agreementId !== agreementId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export { 
  getAgreementHistory as getLocalHistory, 
  saveAgreementToHistory as addToHistory, 
  removeAgreementFromHistory as removeFromHistory 
};
