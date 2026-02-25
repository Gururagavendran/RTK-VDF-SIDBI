import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ChevronRight, Upload } from "lucide-react";
import { useGetApplicationByIdQuery, useSubmitDetailedApplicationMutation } from "@/store/api";
import { getSession } from "@/lib/authStore";
import UnitEconomicsGrid, { unitEconomicsRows, monthColumns } from "@/components/detailed-app/UnitEconomicsGrid";
import FacilitiesApplicant, { emptyFacilityRow, type FacilityRow } from "@/components/detailed-app/FacilitiesApplicant";
import FacilitiesAssociate, { emptyConcern, type Concern } from "@/components/detailed-app/FacilitiesAssociate";
import EligibilityCheck, { initEligibility, type EligibilityItem } from "@/components/detailed-app/EligibilityCheck";
import DocumentUploadSection from "@/components/detailed-app/DocumentUploadSection";

import AppLayout from "@/components/layout/AppLayout";

/* ─── helpers ─── */
const currentFYStart = new Date().getFullYear(); // e.g. 2025 → FY 2025-26
const fyLabel = (start: number, suffix: string) => `FY ${start}-${String(start + 1).slice(2)} (${suffix})`;
const fyColumns = [
  { key: "fy_minus3", label: fyLabel(currentFYStart - 3, "Audited") },
  { key: "fy_minus2", label: fyLabel(currentFYStart - 2, "Audited") },
  { key: "fy_minus1", label: fyLabel(currentFYStart - 1, "Audited / Prov.") },
  { key: "fy_current", label: fyLabel(currentFYStart, "PROJ") },
  { key: "fy_plus1", label: fyLabel(currentFYStart + 1, "PROJ") },
  { key: "fy_plus2", label: fyLabel(currentFYStart + 2, "PROJ") },
];

const financialRows = [
  "Income / Revenue", "EBITDA", "Depreciation", "Interest", "PAT",
  "EBITDA %", "PAT %", "Equity Cap", "Pref Cap", "Reserves",
  "Networth", "Intangible assets", "Secured loans", "Unsecured loans",
];

const generateMonthLabels = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const labels: string[] = [];
  for (let i = 12; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
  }
  return labels;
};
const monthLabels = generateMonthLabels();

type CapitalRow = { id: string; shareholders: string; shareholderType: string; shareholderTypeOther: string; typeOfShare: string; noOfShares: string; noOfEquityShares: string; noOfPrefShares: string; percentHolding: string; amountInvested: string; };
const emptyCapitalRow = (): CapitalRow => ({ id: crypto.randomUUID(), shareholders: "", shareholderType: "", shareholderTypeOther: "", typeOfShare: "", noOfShares: "", noOfEquityShares: "", noOfPrefShares: "", percentHolding: "", amountInvested: "" });

const shareholderTypeOptions = ["Promoters", "AIF", "Family Office", "Strategic/Corporate Investors", "Others"];

const initFinancialData = () => {
  const init: Record<string, Record<string, string>> = {};
  financialRows.forEach((row) => { init[row] = {}; fyColumns.forEach((col) => { init[row][col.key] = ""; }); });
  return init;
};
const initRevenueTrends = () => { const init: Record<string, string> = {}; monthLabels.forEach((m) => { init[m] = ""; }); return init; };
const initUnitEconData = () => { const init: Record<string, Record<string, string>> = {}; unitEconomicsRows.forEach((row) => { init[row] = {}; monthColumns.forEach((col) => { init[row][col] = ""; }); }); return init; };

const declarationTexts = [
  "All information furnished by me/us above in this Application/ Business plan & Project report/ Appendix/ Annexure/ Statements and other papers/documents enclosed are true and correct to the best of my/our knowledge and belief. I/We undertake to furnish all other information that may be required by SIDBI in connection with my/our application for financial assistance. I/We also confirm that I/none of the promoters or directors or partners have at any time declared themselves as insolvent.",
  "I am aware that in relation to the financial assistance applied for, SIDBI requires my consent to pull/have access to credit reports/GST returns/data relating to me/founders/directors and the applicant and verify defaulters' list etc. from CIBIL Consumer Database and other related databases. Accordingly, I hereby irrevocably and unconditionally give my consent authorizing SIDBI for pulling credit reports/data relating to me/founders/directors/associate concerns from the Consumer Data Base of CIBIL and other related databases while considering the application of the applicant and thereafter also in case the financial assistance/commitment is sanctioned by SIDBI to the applicant till currency of the financial assistance or the securities created by me/the applicant whichever is later.",
  "I/We authorize the Partner IM to share information as required by SIDBI pertaining to our company in connection with the application/financial assistance from SIDBI till sanction of assistance/till currency of the financial assistance if availed by us.",
];

const SECTIONS = ["Founders / Business", "Financial Position", "Funding Sought from SIDBI", "Certifications / Compliances"];


const DRAFT_KEY = "detailed_app_draft";

const DetailedApplication = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appId = searchParams.get("appId") || "";
  const readOnly = searchParams.get("readOnly") === "true";
  const topRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* State — same as before */
  const [companyProfile, setCompanyProfile] = useState("");
  const [capitalRows, setCapitalRows] = useState<CapitalRow[]>([emptyCapitalRow()]);
  const [financialData, setFinancialData] = useState(initFinancialData);
  const [revenueTrends, setRevenueTrends] = useState(initRevenueTrends);
  const [arrears, setArrears] = useState("");
  const [enterpriseValue, setEnterpriseValue] = useState("");
  const [unitEconDesc, setUnitEconDesc] = useState("");
  const [unitEconData, setUnitEconData] = useState(initUnitEconData);
  const [cashBalance, setCashBalance] = useState("");
  const [cashRunway, setCashRunway] = useState("");
  const [fundingWithdrawn, setFundingWithdrawn] = useState(false);
  const [fundingWithdrawnDetails, setFundingWithdrawnDetails] = useState("");
  const [facilitiesAvailed, setFacilitiesAvailed] = useState(false);
  const [facilitiesAvailedDetails, setFacilitiesAvailedDetails] = useState("");
  const [facilityRows, setFacilityRows] = useState<FacilityRow[]>([emptyFacilityRow()]);
  const [assocConcerns, setAssocConcerns] = useState<Concern[]>([emptyConcern()]);
  const [totalFunding, setTotalFunding] = useState("");
  const [amountFromSidbi, setAmountFromSidbi] = useState("");
  const [balanceSources, setBalanceSources] = useState("");
  const [proposedUse, setProposedUse] = useState("");
  const [repaymentPeriod, setRepaymentPeriod] = useState("");
  const [moratorium, setMoratorium] = useState("");
  const [securitiesOffered, setSecuritiesOffered] = useState("");
  const [rightsDocument, setRightsDocument] = useState("");
  const [eligibility, setEligibility] = useState(initEligibility);
  const [pendingLitigations, setPendingLitigations] = useState("");
  const [declarations, setDeclarations] = useState([false, false, false]);
  const [signPlace, setSignPlace] = useState("");
  const [signDate, setSignDate] = useState("");
  const [signName, setSignName] = useState("");
  const [signDesignation, setSignDesignation] = useState("");
  const [signEmail, setSignEmail] = useState("");
  const [signFile, setSignFile] = useState("");
  const [aifName, setAifName] = useState("");
  const [aifPlace, setAifPlace] = useState("");
  const [aifDate, setAifDate] = useState("");
  const [aifSignatory, setAifSignatory] = useState("");
  const [aifSignFile, setAifSignFile] = useState("");
  const [detailedDocs, setDetailedDocs] = useState<string[]>([]);
  const [sanctionLetterFile, setSanctionLetterFile] = useState("");
  const [assocSanctionLetterFile, setAssocSanctionLetterFile] = useState("");

  const { data: existingApp } = useGetApplicationByIdQuery(appId, { skip: !appId });
  const [submitDetailed] = useSubmitDetailedApplicationMutation();

  useEffect(() => {
    if (!appId) return;
    if (!existingApp?.detailedData) {
      try { const draftRaw = localStorage.getItem(`${DRAFT_KEY}_${appId}`); if (draftRaw) loadFormData(JSON.parse(draftRaw)); } catch {}
      return;
    }
    loadFormData(existingApp.detailedData);
  }, [appId, existingApp]);

  const loadFormData = (d: any) => {
    if (!d) return;
    if (d.companyProfile) setCompanyProfile(d.companyProfile);
    if (d.capitalTable?.length) setCapitalRows(d.capitalTable);
    if (d.financialPerformance) setFinancialData(d.financialPerformance);
    if (d.revenueTrends) setRevenueTrends(d.revenueTrends);
    if (d.arrears) setArrears(d.arrears);
    if (d.enterpriseValue) setEnterpriseValue(d.enterpriseValue);
    if (d.unitEconomics?.description) setUnitEconDesc(d.unitEconomics.description);
    if (d.unitEconomics?.data) setUnitEconData(d.unitEconomics.data);
    if (d.cashBalance) setCashBalance(d.cashBalance);
    if (d.cashRunway) setCashRunway(d.cashRunway);
    if (d.fundingWithdrawn?.flag !== undefined) { setFundingWithdrawn(d.fundingWithdrawn.flag); setFundingWithdrawnDetails(d.fundingWithdrawn.details || ""); }
    if (d.facilitiesAvailed?.flag !== undefined) { setFacilitiesAvailed(d.facilitiesAvailed.flag); setFacilitiesAvailedDetails(d.facilitiesAvailed.details || ""); }
    if (d.facilitiesApplicant?.length) setFacilityRows(d.facilitiesApplicant);
    if (d.facilitiesAssociate?.length) setAssocConcerns(d.facilitiesAssociate);
    if (d.funding) { setTotalFunding(d.funding.totalFunding || ""); setAmountFromSidbi(d.funding.amountFromSidbi || ""); setBalanceSources(d.funding.balanceSources || ""); setProposedUse(d.funding.proposedUse || ""); setRepaymentPeriod(d.funding.repaymentPeriod || ""); setMoratorium(d.funding.moratorium || ""); setSecuritiesOffered(d.funding.securitiesOffered || ""); setRightsDocument(d.funding.rightsDocument || ""); }
    if (d.aifConfirmation) { setAifName(d.aifConfirmation.name || ""); setAifPlace(d.aifConfirmation.place || ""); setAifDate(d.aifConfirmation.date || ""); setAifSignatory(d.aifConfirmation.signatory || ""); setAifSignFile(d.aifConfirmation.signFile || ""); }
    if (d.signature) { setSignPlace(d.signature.place || ""); setSignDate(d.signature.date || ""); setSignName(d.signature.name || ""); setSignDesignation(d.signature.designation || ""); setSignEmail(d.signature.email || ""); setSignFile(d.signature.signFile || ""); }
    if (d.eligibility) setEligibility(d.eligibility);
    if (d.pendingLitigations) setPendingLitigations(d.pendingLitigations);
    if (d.declarations) setDeclarations(d.declarations);
    if (d.detailedDocs) setDetailedDocs(Array.isArray(d.detailedDocs) ? d.detailedDocs : []);
    if (d.sanctionLetterFile) setSanctionLetterFile(d.sanctionLetterFile);
  };

  const addCapitalRow = () => setCapitalRows((p) => [...p, emptyCapitalRow()]);
  const removeCapitalRow = (id: string) => setCapitalRows((p) => (p.length > 1 ? p.filter((r) => r.id !== id) : p));
  const updateCapitalRow = (id: string, field: keyof CapitalRow, value: string) => setCapitalRows((p) => p.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const updateFinancial = (row: string, col: string, value: string) => setFinancialData((p) => ({ ...p, [row]: { ...p[row], [col]: value } }));
  const updateRevenue = (month: string, value: string) => setRevenueTrends((p) => ({ ...p, [month]: value }));
  const updateUnitEcon = (row: string, col: string, value: string) => setUnitEconData((p) => ({ ...p, [row]: { ...p[row], [col]: value } }));
  const updateEligibility = (sno: string, field: keyof EligibilityItem, value: string | boolean) => setEligibility((p) => ({ ...p, [sno]: { ...p[sno], [field]: value } }));
  const toggleDeclaration = (idx: number) => setDeclarations((p) => p.map((v, i) => (i === idx ? !v : v)));

  const saveDraft = () => {
    const draft = { companyProfile, capitalRows, financialData, revenueTrends, arrears, enterpriseValue, unitEconDesc, unitEconData, cashBalance, cashRunway, fundingWithdrawn, fundingWithdrawnDetails, facilitiesAvailed, facilitiesAvailedDetails, facilityRows, assocConcerns, totalFunding, amountFromSidbi, balanceSources, proposedUse, repaymentPeriod, moratorium, securitiesOffered, eligibility, pendingLitigations, declarations, signPlace, signDate, signName, signDesignation };
    localStorage.setItem(`${DRAFT_KEY}_${appId}`, JSON.stringify(draft));
  };

  const scrollToSection = (idx: number) => { sectionRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const errors: string[] = [];
    if (!companyProfile.trim()) errors.push("Company Profile");
    if (!capitalRows.some(r => r.shareholders.trim() && r.typeOfShare.trim())) errors.push("Capital Table");
    // Validate % holding sums to 100
    const totalHolding = capitalRows.reduce((sum, r) => sum + (parseFloat(r.percentHolding) || 0), 0);
    if (Math.abs(totalHolding - 100) > 0.01) errors.push("% of Holding must sum to 100 (currently " + totalHolding.toFixed(2) + "%)");
    // Validate equity + pref = total shares
    capitalRows.forEach((row, i) => {
      const total = parseInt(row.noOfShares) || 0;
      const eq = parseInt(row.noOfEquityShares) || 0;
      const pref = parseInt(row.noOfPrefShares) || 0;
      if (row.typeOfShare === "Equity" && eq !== total) errors.push(`Row ${i + 1}: No. of Equity Shares must equal No. of Shares`);
      if (row.typeOfShare === "Preference" && pref !== total) errors.push(`Row ${i + 1}: No. of Pref Shares must equal No. of Shares`);
      if (row.typeOfShare === "Both" && (eq + pref) !== total) errors.push(`Row ${i + 1}: Equity + Pref Shares must equal No. of Shares (${eq} + ${pref} ≠ ${total})`);
    });
    if (!financialRows.some(row => fyColumns.some(col => financialData[row][col.key]?.trim()))) errors.push("Financial Performance");
    if (!monthLabels.some(m => revenueTrends[m]?.trim())) errors.push("Revenue Trends");
    if (!arrears.trim()) errors.push("Arrears");
    if (!enterpriseValue.trim()) errors.push("Enterprise Value");
    if (!cashBalance.trim()) errors.push("Cash & Bank Balance");
    if (!cashRunway.trim()) errors.push("Cash Runway");
    if (!totalFunding.trim()) errors.push("Total Funding Requirement");
    if (!amountFromSidbi.trim()) errors.push("Amount from SIDBI");
    if (!repaymentPeriod.trim()) errors.push("Repayment Period is required");
    else { const rp = parseInt(repaymentPeriod.trim()); if (!/^\d+$/.test(repaymentPeriod.trim()) || rp < 1 || rp > 120) errors.push("Repayment Period must be entered in whole months between 1 and 120."); }
    // Validate Section D items 4, 5, 7 details are filled when toggled Yes
    ["4", "5", "7"].forEach((sno) => {
      if (eligibility[sno]?.value) {
        const details = (eligibility[sno]?.details || "").trim();
        if (!details) errors.push(`Details are required for Section D-${sno}.`);
      }
    });
    if (!signPlace.trim() || !signDate.trim() || !signName.trim() || !signDesignation.trim()) errors.push("Signature fields (Place, Date, Name, Designation)");
    if (!signEmail.trim()) errors.push("Email ID is required to complete the declaration.");
    else if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(signEmail.trim())) errors.push("Please enter a valid email address.");
    if (!declarations.every(Boolean)) errors.push("All Declarations must be accepted");
    if (detailedDocs.length === 0) errors.push("Please upload at least one document in the Documents & Due Diligence section.");
    if (errors.length > 0) { toast({ title: "Validation Error", description: `Please fill: ${errors.join(", ")}`, variant: "destructive" }); return; }

    const payload = {
      id: crypto.randomUUID(), companyProfile, capitalTable: capitalRows, financialPerformance: financialData,
      revenueTrends, arrears, enterpriseValue, unitEconomics: { description: unitEconDesc, data: unitEconData },
      cashBalance, cashRunway, fundingWithdrawn: { flag: fundingWithdrawn, details: fundingWithdrawnDetails },
      facilitiesAvailed: { flag: facilitiesAvailed, details: facilitiesAvailedDetails },
      facilitiesApplicant: facilityRows, facilitiesAssociate: assocConcerns,
      funding: { totalFunding, amountFromSidbi, balanceSources, proposedUse, repaymentPeriod, moratorium, securitiesOffered, rightsDocument },
      eligibility, pendingLitigations, declarations, detailedDocs, sanctionLetterFile,
      signature: { place: signPlace, date: signDate, name: signName, designation: signDesignation, email: signEmail, signFile },
      aifConfirmation: { name: aifName, place: aifPlace, date: aifDate, signatory: aifSignatory, signFile: aifSignFile },
      submittedAt: new Date().toISOString(),
    };
    if (appId) submitDetailed({ appId, detailedData: payload });
    localStorage.removeItem(`${DRAFT_KEY}_${appId}`);
    toast({ title: "Detailed Application Submitted", description: "Your application has been saved successfully." });
    navigate("/applicant/dashboard");
  };

  /* ─── Section rendering helpers ─── */
  const GovSectionHeader = ({ title }: { title: string }) => (
    <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
      <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">{title}</h2>
    </div>
  );

  const GovField = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="font-semibold text-xs uppercase tracking-wide text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );

  return (
    <AppLayout
      title="SIDBI — Applicant Portal"
      subtitle="Detailed Application"
      backTo="/applicant/dashboard"
      backLabel="Back to Dashboard"
      breadcrumbs={[
        { label: "Dashboard", href: "/applicant/dashboard" },
        { label: "Detailed Application" },
      ]}
      maxWidth="max-w-5xl"
    >
      <div className="mx-auto max-w-5xl space-y-6" ref={topRef}>
        {/* Progress indicator */}
        <div className="bg-card border border-border p-4 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground uppercase tracking-wide">
            Stage: Detailed Application
          </p>
          {readOnly && <span className="gov-badge bg-muted text-muted-foreground border-border">VIEW ONLY</span>}
        </div>

          {/* Section navigation */}
          <nav className="sticky top-0 z-10 bg-card border border-border p-3">
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {SECTIONS.map((section, idx) => (
                <div key={idx} className="flex items-center">
                  <button type="button" onClick={() => scrollToSection(idx)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-border hover:bg-primary hover:text-primary-foreground transition-colors">
                    {section}
                  </button>
                  {idx < SECTIONS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                </div>
              ))}
            </div>
          </nav>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION A: Founders / Business */}
            <div ref={(el) => { sectionRefs.current[0] = el; }} className="scroll-mt-24">
              <div className="bg-card border border-border">
                <GovSectionHeader title="Section A — Founders / Business" />
                <div className="p-6">
                  <GovField label="Company Profile" required>
                    <Textarea value={companyProfile} onChange={(e) => setCompanyProfile(e.target.value)} placeholder="Brief history, activities, founders, product, team profile… (max 1000 words)" className="min-h-[180px]" maxLength={7000} disabled={readOnly} />
                    <p className="text-xs text-muted-foreground mt-1">Company / Founders / Product / Team Profile. Please enclose pitch deck / investor presentation, if available.</p>
                  </GovField>
                </div>
              </div>
              {!readOnly && (
                <div className="flex justify-end mt-3">
                  <Button type="button" onClick={() => { saveDraft(); scrollToSection(1); }} className="font-bold uppercase tracking-wider text-xs">
                    Save &amp; Next
                  </Button>
                </div>
              )}
            </div>

            {/* SECTION B: Financial Position */}
            <div ref={(el) => { sectionRefs.current[1] = el; }} className="scroll-mt-24 space-y-6">
              {/* Capital Table */}
              <div className="bg-card border border-border">
                <GovSectionHeader title="Section B — Financial Position — Capital Table" />
                <div className="p-6">
                  <p className="text-xs text-muted-foreground mb-4">Capital Table on Fully Diluted Basis</p>
                  <div className="overflow-x-auto">
                    <table className="gov-table">
                      <thead><tr>
                        <th>Name of the Shareholder(s)</th>
                        <th>Type of Shareholder</th>
                        <th>Type of Share</th>
                        <th>No. of Shares</th>
                        <th>No. of Equity Shares</th>
                        <th>No. of Pref Shares</th>
                        <th>% of Holding</th>
                        <th>Amount Invested (₹ Lakh)</th>
                        {!readOnly && <th className="w-10"></th>}
                      </tr></thead>
                      <tbody>
                        {capitalRows.map((row) => {
                          const showEquity = row.typeOfShare === "Equity" || row.typeOfShare === "Both";
                          const showPref = row.typeOfShare === "Preference" || row.typeOfShare === "Both";
                          return (
                          <tr key={row.id}>
                            <td><Input value={row.shareholders} onChange={(e) => updateCapitalRow(row.id, "shareholders", e.target.value)} placeholder="Name" disabled={readOnly} /></td>
                            <td>
                              <div className="space-y-1">
                                <Select value={row.shareholderType} onValueChange={(v) => { updateCapitalRow(row.id, "shareholderType", v); if (v !== "Others") updateCapitalRow(row.id, "shareholderTypeOther", ""); }} disabled={readOnly}>
                                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                                  <SelectContent>{shareholderTypeOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                </Select>
                                {row.shareholderType === "Others" && <Input value={row.shareholderTypeOther} onChange={(e) => updateCapitalRow(row.id, "shareholderTypeOther", e.target.value)} placeholder="Specify type" disabled={readOnly} className="h-8 text-xs" />}
                              </div>
                            </td>
                            <td>
                              <Select value={row.typeOfShare} onValueChange={(v) => {
                                updateCapitalRow(row.id, "typeOfShare", v);
                                // Clear irrelevant fields on type change
                                if (v === "Equity") updateCapitalRow(row.id, "noOfPrefShares", "");
                                if (v === "Preference") updateCapitalRow(row.id, "noOfEquityShares", "");
                              }} disabled={readOnly}>
                                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent><SelectItem value="Equity">Equity</SelectItem><SelectItem value="Preference">Preference</SelectItem><SelectItem value="Both">Both</SelectItem></SelectContent>
                              </Select>
                            </td>
                            <td><Input type="text" inputMode="numeric" value={row.noOfShares} onChange={(e) => updateCapitalRow(row.id, "noOfShares", e.target.value)} placeholder="0" disabled={readOnly} /></td>
                            <td>{showEquity ? <Input type="text" inputMode="numeric" value={row.noOfEquityShares} onChange={(e) => updateCapitalRow(row.id, "noOfEquityShares", e.target.value)} placeholder="0" disabled={readOnly} /> : <span className="text-muted-foreground text-xs">N/A</span>}</td>
                            <td>{showPref ? <Input type="text" inputMode="numeric" value={row.noOfPrefShares} onChange={(e) => updateCapitalRow(row.id, "noOfPrefShares", e.target.value)} placeholder="0" disabled={readOnly} /> : <span className="text-muted-foreground text-xs">N/A</span>}</td>
                            <td><Input type="text" inputMode="decimal" value={row.percentHolding} onChange={(e) => updateCapitalRow(row.id, "percentHolding", e.target.value)} placeholder="0.00" disabled={readOnly} /></td>
                            <td><Input type="text" inputMode="decimal" value={row.amountInvested} onChange={(e) => updateCapitalRow(row.id, "amountInvested", e.target.value)} placeholder="0.00" disabled={readOnly} /></td>
                            {!readOnly && <td><Button type="button" variant="ghost" size="icon" onClick={() => removeCapitalRow(row.id)} disabled={capitalRows.length === 1}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>}
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {!readOnly && <Button type="button" variant="outline" size="sm" onClick={addCapitalRow} className="mt-3 font-bold uppercase tracking-wider text-xs"><Plus className="mr-1 h-4 w-4" /> Add Row</Button>}
                  {/* % Holding total indicator */}
                  {!readOnly && (() => {
                    const total = capitalRows.reduce((sum, r) => sum + (parseFloat(r.percentHolding) || 0), 0);
                    return (
                      <p className={`mt-2 text-xs font-bold ${Math.abs(total - 100) > 0.01 ? "text-destructive" : "text-green-700"}`}>
                        Total % of Holding: {total.toFixed(2)}% {Math.abs(total - 100) > 0.01 ? "(must equal 100%)" : "✓"}
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Financial Performance */}
              <div className="bg-card border border-border">
                <GovSectionHeader title="Financial / Operational Performance" />
                <div className="p-6">
                  <p className="text-xs text-muted-foreground mb-4">Amounts in ₹ Crore. Please specify whether audited / provisional.</p>
                  <div className="overflow-x-auto">
                    <table className="gov-table text-xs">
                      <thead><tr>
                        <th className="min-w-[160px]">Particulars</th>
                        {fyColumns.map((col) => <th key={col.key} className="min-w-[110px] text-center">{col.label}</th>)}
                      </tr></thead>
                      <tbody>
                        {financialRows.map((row) => (
                          <tr key={row}>
                            <td className="font-semibold whitespace-nowrap">{row}</td>
                            {fyColumns.map((col) => (
                              <td key={col.key}><Input type="text" inputMode="decimal" value={financialData[row][col.key]} onChange={(e) => updateFinancial(row, col.key, e.target.value)} placeholder="0.00" className="text-center h-8 text-xs" disabled={readOnly} /></td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Revenue Trends */}
              <div className="bg-card border border-border">
                <GovSectionHeader title="Revenue Trends (Main Revenue Streams)" />
                <div className="p-6">
                  <p className="text-xs text-muted-foreground mb-4">Monthly revenue for the last 12 months (in ₹ Crore)</p>
                  <div className="overflow-x-auto">
                    <table className="gov-table text-xs">
                      <thead><tr>{monthLabels.map((m) => <th key={m} className="min-w-[90px] text-center">{m}</th>)}</tr></thead>
                      <tbody><tr>{monthLabels.map((m) => <td key={m}><Input type="text" inputMode="decimal" value={revenueTrends[m]} onChange={(e) => updateRevenue(m, e.target.value)} placeholder="0.00" className="text-center h-8 text-xs" disabled={readOnly} /></td>)}</tr></tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Arrears, Enterprise Value, Unit Economics, Cash, Funding */}
              {[
                { title: "Arrears of Statutory Dues", value: arrears, onChange: setArrears, placeholder: "Details of any arrears of statutory dues, if any…" },
                { title: "Enterprise Value and Basis of Valuation", value: enterpriseValue, onChange: setEnterpriseValue, placeholder: "Enterprise value and basis of valuation…" },
                { title: "Cash & Bank Balance", value: cashBalance, onChange: setCashBalance, placeholder: "Details of cash and bank balance…" },
                { title: "Cash Runway", value: cashRunway, onChange: setCashRunway, placeholder: "Details of cash runway…" },
              ].map((item) => (
                <div key={item.title} className="bg-card border border-border">
                  <GovSectionHeader title={item.title} />
                  <div className="p-6">
                    <Textarea value={item.value} onChange={(e) => item.onChange(e.target.value)} placeholder={item.placeholder} className="min-h-[120px]" disabled={readOnly} />
                  </div>
                </div>
              ))}

              {/* Unit Economics */}
              <UnitEconomicsGrid data={unitEconData} onDataChange={updateUnitEcon} />

              {/* Funding Commitments */}
              <div className="bg-card border border-border">
                <GovSectionHeader title="Funding Commitments Withdrawn or Deferred" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Switch checked={fundingWithdrawn} onCheckedChange={readOnly ? undefined : setFundingWithdrawn} disabled={readOnly} />
                    <Label>{fundingWithdrawn ? "Yes" : "No"}</Label>
                  </div>
                  {fundingWithdrawn && <Textarea value={fundingWithdrawnDetails} onChange={(e) => setFundingWithdrawnDetails(e.target.value)} placeholder="Provide details…" className="min-h-[120px]" disabled={readOnly} />}
                </div>
              </div>

              {/* Facilities Availed */}
              <div className="bg-card border border-border">
                <GovSectionHeader title="Facilities Availed" />
                <div className="p-6 space-y-4">
                  <p className="text-xs text-muted-foreground">Including borrowings / venture debt / non fund-based credit facilities</p>
                  <div className="flex items-center gap-3">
                    <Switch checked={facilitiesAvailed} onCheckedChange={readOnly ? undefined : setFacilitiesAvailed} disabled={readOnly} />
                    <Label>{facilitiesAvailed ? "Yes" : "No"}</Label>
                  </div>
                  {facilitiesAvailed && <Textarea value={facilitiesAvailedDetails} onChange={(e) => setFacilitiesAvailedDetails(e.target.value)} placeholder="Provide details…" className="min-h-[120px]" disabled={readOnly} />}
                  
                </div>
              </div>

              {facilitiesAvailed && (
                <>
                  <FacilitiesApplicant rows={facilityRows} onChange={setFacilityRows} sanctionLetterFile={sanctionLetterFile} onSanctionLetterChange={setSanctionLetterFile} readOnly={readOnly} />
                  <FacilitiesAssociate concerns={assocConcerns} onChange={setAssocConcerns} sanctionLetterFile={assocSanctionLetterFile} onSanctionLetterChange={setAssocSanctionLetterFile} readOnly={readOnly} />
                </>
              )}
              {!readOnly && (
                <div className="flex justify-end mt-3">
                  <Button type="button" onClick={() => { saveDraft(); scrollToSection(2); }} className="font-bold uppercase tracking-wider text-xs">
                    Save &amp; Next
                  </Button>
                </div>
              )}
            </div>

            {/* SECTION C: Funding Sought */}
            <div ref={(el) => { sectionRefs.current[2] = el; }} className="scroll-mt-24">
              <div className="bg-card border border-border">
                <GovSectionHeader title="Section C — Funding Sought from SIDBI" />
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GovField label="Total Funding Requirement (₹ Crore)" required>
                      <Input type="text" inputMode="decimal" value={totalFunding} onChange={(e) => setTotalFunding(e.target.value)} placeholder="0.00" disabled={readOnly} />
                    </GovField>
                    <GovField label="Amount from SIDBI (₹ Crore)" required>
                      <Input type="text" inputMode="decimal" value={amountFromSidbi} onChange={(e) => setAmountFromSidbi(e.target.value)} placeholder="0.00" disabled={readOnly} />
                    </GovField>
                    <GovField label="Repayment Period (in Months)" required>
                      <Input type="text" inputMode="numeric" pattern="[0-9]*" value={repaymentPeriod} onChange={(e) => { const v = e.target.value; if (v === "" || /^\d{0,3}$/.test(v)) setRepaymentPeriod(v); }} placeholder="Enter number of months" disabled={readOnly} />
                    </GovField>
                    <GovField label="Moratorium Sought (in Months)">
                      <Input type="text" value={moratorium} onChange={(e) => setMoratorium(e.target.value)} placeholder="In months" disabled={readOnly} />
                    </GovField>
                  </div>
                  <GovField label="Sources for Balance Requirement">
                    <Textarea value={balanceSources} onChange={(e) => setBalanceSources(e.target.value)} placeholder="Sources for balance requirement…" className="min-h-[100px]" disabled={readOnly} />
                  </GovField>
                  <GovField label="Proposed Use of Funds">
                    <Textarea value={proposedUse} onChange={(e) => setProposedUse(e.target.value)} placeholder="Proposed use of funds…" className="min-h-[100px]" disabled={readOnly} />
                  </GovField>
                  <GovField label="Securities Offered (in brief)">
                    <Textarea value={securitiesOffered} onChange={(e) => setSecuritiesOffered(e.target.value)} placeholder="Securities offered…" className="min-h-[100px]" disabled={readOnly} />
                  </GovField>
                  <GovField label="Rights being provided to partner AIF / IM (if any)">
                    <div className="space-y-2">
                      {rightsDocument && <p className="text-sm text-muted-foreground">Uploaded: {rightsDocument}</p>}
                      {!readOnly && (
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="h-9 text-xs"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setRightsDocument(file.name);
                          }}
                        />
                      )}
                      {readOnly && !rightsDocument && <p className="text-sm text-muted-foreground">—</p>}
                    </div>
                  </GovField>
                </div>
              </div>
              {!readOnly && (
                <div className="flex justify-end mt-3">
                  <Button type="button" onClick={() => { saveDraft(); scrollToSection(3); }} className="font-bold uppercase tracking-wider text-xs">
                    Save &amp; Next
                  </Button>
                </div>
              )}
            </div>

            {/* SECTION D: Certifications / Compliances */}
            <div ref={(el) => { sectionRefs.current[3] = el; }} className="scroll-mt-24 space-y-6">
              <div className="bg-card border border-border p-1">
                <GovSectionHeader title="Section D — Certifications / Compliances" />
              </div>
              <EligibilityCheck data={eligibility} onChange={updateEligibility} readOnly={readOnly} />

              <div className="bg-card border border-border">
                <GovSectionHeader title="Any Pending Litigations" />
                <div className="p-6">
                  <Textarea value={pendingLitigations} onChange={(e) => setPendingLitigations(e.target.value)} placeholder="Details of any pending litigations…" className="min-h-[120px]" disabled={readOnly} />
                </div>
              </div>

              <div className="bg-card border border-border">
                <GovSectionHeader title="Declaration" />
                <div className="p-6 space-y-6">
                  <p className="text-sm text-muted-foreground">I/We hereby certify that:</p>
                  {declarationTexts.map((text, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <Checkbox id={`decl-${idx}`} checked={declarations[idx]} onCheckedChange={() => !readOnly && toggleDeclaration(idx)} className="mt-1" disabled={readOnly} />
                      <Label htmlFor={`decl-${idx}`} className="text-sm leading-relaxed font-normal text-muted-foreground cursor-pointer">
                        ({String.fromCharCode(105 + idx)}) {text}
                      </Label>
                    </div>
                  ))}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                    <GovField label="Name of Declarant" required><Input value={signName} onChange={(e) => setSignName(e.target.value)} placeholder="Full name" disabled={readOnly} /></GovField>
                    <GovField label="Designation" required><Input value={signDesignation} onChange={(e) => setSignDesignation(e.target.value)} placeholder="Director / Managing Director" disabled={readOnly} /></GovField>
                    <GovField label="Email ID of Declarant" required>
                      <Input type="email" value={signEmail} onChange={(e) => setSignEmail(e.target.value.toLowerCase().trim())} placeholder="Enter official email address" disabled={readOnly} />
                      {signEmail && !/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(signEmail) && (
                        <p className="text-xs text-destructive mt-1">Please enter a valid email address.</p>
                      )}
                      {signEmail && (() => { const s = getSession(); return s?.email && signEmail !== s.email; })() && /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(signEmail) && (
                        <p className="text-xs text-warning mt-1">⚠ Email ID does not match logged-in user credentials.</p>
                      )}
                    </GovField>
                    <GovField label="Date" required><Input type="date" value={signDate} onChange={(e) => setSignDate(e.target.value)} disabled={readOnly} /></GovField>
                    <GovField label="Place" required><Input value={signPlace} onChange={(e) => setSignPlace(e.target.value)} placeholder="Place" disabled={readOnly} /></GovField>
                  </div>
                  <GovField label="Applicant Signature (Upload)">
                    <div className="space-y-2">
                      {signFile && <p className="text-sm text-muted-foreground">Uploaded: {signFile}</p>}
                      {!readOnly && (
                        <Input type="file" accept=".png,.jpg,.jpeg,.pdf" className="h-9 text-xs" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSignFile(f.name); }} />
                      )}
                      {readOnly && !signFile && <p className="text-sm text-muted-foreground">—</p>}
                    </div>
                  </GovField>
                </div>
              </div>
            </div>

            {/* AIF / IM Confirmation */}
            <div className="bg-card border border-border">
              <GovSectionHeader title="AIF / Investment Manager Confirmation" />
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We confirm that the contents of the above application are true and correct to the best of our information. We confirm having invested in the above MSME / Start-up company and request SIDBI to consider the application for sanction of assistance.
                </p>
                <GovField label="Name of AIF / Investment Manager">
                  <Input value={aifName} onChange={(e) => setAifName(e.target.value)} placeholder="Name of AIF / Investment Manager" disabled={readOnly} />
                </GovField>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GovField label="Place"><Input value={aifPlace} onChange={(e) => setAifPlace(e.target.value)} placeholder="Place" disabled={readOnly} /></GovField>
                  <GovField label="Date"><Input type="date" value={aifDate} onChange={(e) => setAifDate(e.target.value)} disabled={readOnly} /></GovField>
                </div>
                <GovField label="AIF Authorised Signatory (Upload)">
                  <div className="space-y-2">
                    {aifSignFile && <p className="text-sm text-muted-foreground">Uploaded: {aifSignFile}</p>}
                    {!readOnly && (
                      <Input type="file" accept=".png,.jpg,.jpeg,.pdf" className="h-9 text-xs" onChange={(e) => { const f = e.target.files?.[0]; if (f) setAifSignFile(f.name); }} />
                    )}
                    {readOnly && !aifSignFile && <p className="text-sm text-muted-foreground">—</p>}
                  </div>
                </GovField>
              </div>
            </div>

            {/* Documents & Due Diligence */}
            <DocumentUploadSection files={detailedDocs} onChange={setDetailedDocs} readOnly={readOnly} />


            {!readOnly && (
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/applicant/dashboard")} className="font-bold uppercase tracking-wider">Cancel</Button>
                <Button type="submit" className="font-bold uppercase tracking-wider px-8" disabled={!declarations.every(Boolean)}>Submit Detailed Application</Button>
              </div>
            )}
          </form>
        </div>
    </AppLayout>
  );
};

export default DetailedApplication;
