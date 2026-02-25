// ─────────────────────────────────────────────────────────────────────────────
// prelimConfig.ts — Single source of truth for preliminary application fields
// ─────────────────────────────────────────────────────────────────────────────

export const eligibilityParams = [
  { key: "entityType", sno: "1", label: "Entity type", requirement: "Pvt Ltd for startups; all MSMEs eligible ≤10 years (Not mandatory for MSMEs)" },
  { key: "vintage", sno: "2", label: "Vintage", requirement: "≤10 years (Not mandatory for MSMEs)" },
  { key: "recentEquity", sno: "3", label: "Recent AIF/FVCI equity", requirement: "≥1 round within last 15 months" },
  { key: "aggregateEquity", sno: "4", label: "Aggregate non-exited equity", requirement: "≥ ₹10 Cr from AIF/FVCIs" },
  { key: "operatingIncome", sno: "5", label: "Operating income", requirement: "≥ ₹10 Cr in last 2 audited FYs" },
  { key: "revenueGrowth", sno: "6", label: "Revenue growth trend", requirement: "Regular growth over last 12 months" },
  { key: "netWorth", sno: "7", label: "Net worth vs assistance", requirement: "Net worth ≥ proposed VD" },
  { key: "unitEconomics", sno: "8", label: "Positive unit economics", requirement: "Positive contribution per unit" },
  { key: "cashFlow", sno: "9", label: "Cash flow projections", requirement: "Projections with ~25% cushion" },
  { key: "existingCustomer", sno: "10", label: "Existing SIDBI customer", requirement: "Eligible if other criteria met" },
  { key: "promoterCapital", sno: "11", label: "Promoter capital infusion", requirement: "Founder has invested own capital" },
  { key: "derTotalDebt", sno: "12A", label: "DER (Total Debt)", requirement: "DER ≤ 2:1" },
  { key: "derTermLoans", sno: "12B", label: "DER (Only Term Loans)", requirement: "DER ≤ 2:1" },
  { key: "debtValuation", sno: "12C", label: "Debt / Valuation", requirement: "≤ 10% of Enterprise Valuation" },
  { key: "writtenOff", sno: "13A", label: "Written-off / restructured", requirement: "Not written-off or restructured (last 2 yrs)" },
  { key: "stressSma", sno: "13B", label: "Stress / SMA", requirement: "Not SMA / stressed in last 12 months" },
  { key: "regularWc", sno: "13C", label: "Regular WC limits", requirement: "No regular WC limits (exceptions allowed)" },
] as const;

export type EligibilityKey = (typeof eligibilityParams)[number]["key"];
export type EligibilityRemarksKey = `${EligibilityKey}Remarks`;

/** Named document upload slots for prelim application */
export const prelimDocumentSlots = [
  { key: "docPitchDeck", label: "Pitch Deck" },
  { key: "docBalanceSheet1", label: "Balance Sheet — Year 1 (Latest)" },
  { key: "docBalanceSheet2", label: "Balance Sheet — Year 2" },
  { key: "docBalanceSheet3", label: "Balance Sheet — Year 3" },
  { key: "docAuditorsNote", label: "Auditors Note" },
] as const;

export type DocSlotKey = (typeof prelimDocumentSlots)[number]["key"];

/** Flat list of prelim fields for rendering in view mode (AIF fields + eligibility toggles) */
export const prelimViewFields = [
  { key: "aifName", label: "Name of AIF / IM" },
  { key: "businessModel", label: "Business Model" },
  { key: "amountInvestedPast", label: "Amount Invested in the Past (₹ Cr)" },
  { key: "investmentAsOnDate", label: "Investment as on Date (₹ Cr)" },
  { key: "additionalInvestment", label: "Additional Investment Being Considered (₹ Cr)" },
  ...eligibilityParams.flatMap((p) => [
    { key: p.key, label: p.label },
    { key: `${p.key}Remarks`, label: `${p.label} — Remarks` },
  ]),
  ...prelimDocumentSlots.map((d) => ({ key: d.key, label: d.label })),
];
