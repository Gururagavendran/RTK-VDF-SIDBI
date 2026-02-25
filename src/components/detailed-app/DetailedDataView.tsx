/**
 * DetailedDataView — Read-only renderer for ALL detailed application fields.
 * Used in both ApplicationView (applicant) and SidbiApplicationReview (SIDBI).
 */
import { eligibilityParams, type EligibilityItem } from "./EligibilityCheck";
import { unitEconomicsRows, monthColumns } from "./UnitEconomicsGrid";
import { requiredDocumentsList } from "./DocumentUploadSection";
import type { FacilityRow } from "./FacilitiesApplicant";
import type { Concern } from "./FacilitiesAssociate";
import { CheckCircle2, XCircle } from "lucide-react";

const GovSectionHeader = ({ title }: { title: string }) => (
  <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
    <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">{title}</h2>
  </div>
);

const KVRow = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div className="grid grid-cols-[200px_1fr] gap-2 py-2 border-b border-border last:border-0 text-sm">
    <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
    <span className="text-foreground whitespace-pre-wrap">{value || "—"}</span>
  </div>
);

/* FY helpers — mirror DetailedApplication.tsx */
const currentFYStart = new Date().getFullYear();
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

const declarationTexts = [
  "All information furnished by me/us above in this Application/ Business plan & Project report/ Appendix/ Annexure/ Statements and other papers/documents enclosed are true and correct to the best of my/our knowledge and belief.",
  "I am aware that in relation to the financial assistance applied for, SIDBI requires my consent to pull/have access to credit reports/GST returns/data relating to me/founders/directors and the applicant.",
  "I/We authorize the Partner IM to share information as required by SIDBI pertaining to our company in connection with the application/financial assistance from SIDBI.",
];

interface DetailedDataViewProps {
  data: any;
}

const DetailedDataView = ({ data }: DetailedDataViewProps) => {
  if (!data) return null;
  const d = data;

  return (
    <div className="space-y-6">
      {/* ─── A: Company Profile ─── */}
      <div className="bg-card border border-border">
        <GovSectionHeader title="Section A — Company / Founders / Product / Team Profile" />
        <div className="p-6">
          <p className="text-sm whitespace-pre-wrap">{d.companyProfile || "—"}</p>
        </div>
      </div>

      {/* ─── B: Financial Position ─── */}

      {/* Capital Table */}
      {d.capitalTable?.length > 0 && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Capital Table (Fully Diluted Basis)" />
          <div className="p-6 overflow-auto">
            <table className="gov-table text-xs">
              <thead>
                <tr>
                  <th>Shareholder Name</th>
                  <th>Type of Shareholder</th>
                  <th>Type of Share</th>
                  <th>No. of Shares</th>
                  <th>% Holding</th>
                  <th>Amount Invested (₹ Lakh)</th>
                </tr>
              </thead>
              <tbody>
                {d.capitalTable.map((row: any, i: number) => (
                  <tr key={i}>
                    <td>{row.shareholders || "—"}</td>
                    <td>{row.shareholderType === "Others" ? (row.shareholderTypeOther || "Others") : (row.shareholderType || "—")}</td>
                    <td>{row.typeOfShare || "—"}</td>
                    <td>{row.noOfShares || "—"}</td>
                    <td>{row.percentHolding || "—"}</td>
                    <td>{row.amountInvested || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Performance */}
      {d.financialPerformance && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Financial / Operational Performance (₹ Crore)" />
          <div className="p-6 overflow-auto">
            <table className="gov-table text-xs">
              <thead>
                <tr>
                  <th className="min-w-[160px]">Particulars</th>
                  {fyColumns.map((col) => (
                    <th key={col.key} className="min-w-[110px] text-center">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {financialRows.map((row) => (
                  <tr key={row}>
                    <td className="font-semibold whitespace-nowrap">{row}</td>
                    {fyColumns.map((col) => (
                      <td key={col.key} className="text-center">
                        {d.financialPerformance[row]?.[col.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Trends */}
      {d.revenueTrends && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Revenue Trends (Last 12 Months)" />
          <div className="p-6 overflow-auto">
            <table className="gov-table text-xs">
              <thead>
                <tr>
                  {monthLabels.map((m) => (
                    <th key={m} className="min-w-[90px] text-center">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {monthLabels.map((m) => (
                    <td key={m} className="text-center">{d.revenueTrends[m] || "—"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Text fields */}
      <div className="bg-card border border-border">
        <GovSectionHeader title="Other Financial Details" />
        <div className="p-6 space-y-0">
          <KVRow label="Arrears of Statutory Dues" value={d.arrears} />
          <KVRow label="Enterprise Value & Valuation Basis" value={d.enterpriseValue} />
          <KVRow label="Cash & Bank Balance" value={d.cashBalance} />
          <KVRow label="Cash Runway" value={d.cashRunway} />
          <KVRow label="Funding Withdrawn / Deferred" value={
            d.fundingWithdrawn?.flag ? `Yes — ${d.fundingWithdrawn.details || ""}` : "No"
          } />
          <KVRow label="Facilities Availed" value={
            d.facilitiesAvailed?.flag ? `Yes — ${d.facilitiesAvailed.details || ""}` : "No"
          } />
        </div>
      </div>

      {/* Unit Economics */}
      {d.unitEconomics && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Unit Economics (Monthly)" />
          <div className="p-6 space-y-4">
            {d.unitEconomics.description && (
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{d.unitEconomics.description}</p>
              </div>
            )}
            {d.unitEconomics.data && (
              <div className="overflow-auto">
                <table className="gov-table text-xs">
                  <thead>
                    <tr>
                      <th className="min-w-[150px]">Particulars</th>
                      {monthColumns.map((m) => (
                        <th key={m} className="min-w-[80px] text-center">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {unitEconomicsRows.map((row) => (
                      <tr key={row}>
                        <td className="font-semibold whitespace-nowrap">{row}</td>
                        {monthColumns.map((col) => (
                          <td key={col} className="text-center">
                            {d.unitEconomics.data[row]?.[col] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Facilities by Applicant */}
      {d.facilitiesApplicant?.length > 0 && d.facilitiesApplicant.some((r: FacilityRow) => r.institution) && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Facilities Availed by Applicant" />
          <div className="p-6 overflow-auto">
            <table className="gov-table text-xs">
              <thead>
                <tr>
                  <th>Institution</th><th>Facility</th><th>Date of Sanction</th>
                  <th>Sanct. Amt (₹ Cr)</th><th>O/s (₹ Cr)</th><th>RoI %</th><th>Security</th>
                </tr>
              </thead>
              <tbody>
                {d.facilitiesApplicant.map((row: FacilityRow, i: number) => (
                  <tr key={i}>
                    <td>{row.institution || "—"}</td><td>{row.facility || "—"}</td>
                    <td>{row.dateOfSanction || "—"}</td><td>{row.sanctionedAmount || "—"}</td>
                    <td>{row.outstanding || "—"}</td><td>{row.roiPercent || "—"}</td>
                    <td>{row.security || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Facilities by Associate Concerns */}
      {d.facilitiesAssociate?.length > 0 && d.facilitiesAssociate.some((c: Concern) => c.name) && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Facilities Availed by Associate Concerns" />
          <div className="p-6 space-y-6">
            {d.facilitiesAssociate.map((concern: Concern, ci: number) => (
              <div key={ci}>
                <p className="font-semibold text-sm mb-2 text-foreground">
                  Concern: {concern.name || `Concern ${ci + 1}`}
                </p>
                <div className="overflow-auto">
                  <table className="gov-table text-xs">
                    <thead>
                      <tr>
                        <th>Institution</th><th>Facility</th><th>Date of Sanction</th>
                        <th>Sanct. Amt (₹ Cr)</th><th>O/s (₹ Cr)</th><th>RoI %</th><th>Security</th>
                      </tr>
                    </thead>
                    <tbody>
                      {concern.rows.map((row, ri: number) => (
                        <tr key={ri}>
                          <td>{row.institution || "—"}</td><td>{row.facility || "—"}</td>
                          <td>{row.dateOfSanction || "—"}</td><td>{row.sanctionedAmount || "—"}</td>
                          <td>{row.outstanding || "—"}</td><td>{row.roiPercent || "—"}</td>
                          <td>{row.security || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── C: Funding Sought ─── */}
      <div className="bg-card border border-border">
        <GovSectionHeader title="Section C — Funding Sought from AIF / SIDBI" />
        <div className="p-6 space-y-0">
          <KVRow label="Total Funding Requirement (₹ Crore)" value={d.funding?.totalFunding} />
          <KVRow label="Amount from SIDBI (₹ Crore)" value={d.funding?.amountFromSidbi} />
          <KVRow label="Sources for Balance" value={d.funding?.balanceSources} />
          <KVRow label="Proposed Use of Funds" value={d.funding?.proposedUse} />
          <KVRow label="Repayment Period (in Months)" value={d.funding?.repaymentPeriod ? `${d.funding.repaymentPeriod} Months` : ""} />
          <KVRow label="Moratorium Sought" value={d.funding?.moratorium} />
          <KVRow label="Securities Offered" value={d.funding?.securitiesOffered} />
          <KVRow label="Rights provided to partner AIF / IM" value={d.funding?.rightsDocument} />
        </div>
      </div>

      {/* ─── D: Eligibility / Compliance ─── */}
      {d.eligibility && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Section D — Eligibility / Compliance Checklist" />
          <div className="p-6 overflow-auto">
            <table className="gov-table text-xs">
              <thead>
                <tr>
                  <th className="w-12">S.No</th>
                  <th>Parameter</th>
                  <th className="w-20 text-center">Value</th>
                </tr>
              </thead>
              <tbody>
                {eligibilityParams.map((p) => {
                  const item: EligibilityItem | undefined = d.eligibility[p.sno];
                  return (
                    <tr key={p.sno} className="align-top">
                      <td className="font-medium">{p.sno}</td>
                      <td>
                        <span className="leading-relaxed">{p.label}</span>
                        {p.hasDetails && item?.value && item?.details && (
                          <p className="mt-1 text-muted-foreground italic">{item.details}</p>
                        )}
                      </td>
                      <td className="text-center font-semibold">
                        {item?.value ? "Yes" : "No"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documents & Due Diligence Checklist */}
      {d.detailedDocs && Array.isArray(d.detailedDocs) && d.detailedDocs.length > 0 && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Documents & Due Diligence" />
          <div className="p-6 space-y-2">
            <p className="text-sm font-semibold mb-2">Uploaded Files ({d.detailedDocs.length})</p>
            {d.detailedDocs.map((name: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Litigations */}
      <div className="bg-card border border-border">
        <GovSectionHeader title="Pending Litigations" />
        <div className="p-6">
          <p className="text-sm whitespace-pre-wrap">{d.pendingLitigations || "—"}</p>
        </div>
      </div>

      {/* Declarations */}
      {d.declarations && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Declarations & Authorisations" />
          <div className="p-6 space-y-3">
            {declarationTexts.map((text, idx) => (
              <div key={idx} className="flex gap-3 items-start text-sm">
                <span className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center text-xs font-bold ${d.declarations[idx] ? "bg-success/20 text-success border-success" : "bg-muted text-muted-foreground border-border"}`}>
                  {d.declarations[idx] ? "✓" : "—"}
                </span>
                <span className="text-muted-foreground leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature */}
      {d.signature && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="Signature" />
          <div className="p-6 space-y-0">
            <KVRow label="Name of Declarant" value={d.signature.name} />
            <KVRow label="Designation" value={d.signature.designation} />
            <KVRow label="Email ID of Declarant" value={d.signature.email} />
            <KVRow label="Date" value={d.signature.date} />
            <KVRow label="Place" value={d.signature.place} />
            <KVRow label="Digital Signature" value={d.signature.signFile} />
          </div>
        </div>
      )}

      {/* AIF / IM Confirmation */}
      {d.aifConfirmation && (
        <div className="bg-card border border-border">
          <GovSectionHeader title="AIF / Investment Manager Confirmation" />
          <div className="p-6 space-y-0">
            <KVRow label="Name of AIF / Investment Manager" value={d.aifConfirmation.name} />
            <KVRow label="Place" value={d.aifConfirmation.place} />
            <KVRow label="Date" value={d.aifConfirmation.date} />
            <KVRow label="Authorised Signatory" value={d.aifConfirmation.signatory} />
            <KVRow label="Digital Signature" value={d.aifConfirmation.signFile} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedDataView;
