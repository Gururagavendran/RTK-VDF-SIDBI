import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) => (CURRENT_YEAR - i).toString());

export type EligibilityItem = {
  value: boolean;
  details: string;
};


export const eligibilityParams = [
  { sno: "1", label: "Private / public limited company", hasDetails: false },
  { sno: "2A", label: "Whether MSME – Turnover less than ₹250 crore (excluding export sales)", hasDetails: false },
  { sno: "2B", label: "Whether MSME – Investment in Plant & Machinery & Equipment (as per previous year's ITR) less than ₹50 crore", hasDetails: true, detailsPlaceholder: "Please upload ITR details…" },
  { sno: "3A", label: "No. of years of existence – In existence since Year", hasDetails: true, detailsPlaceholder: "Specify year of existence…" },
  { sno: "3B", label: "No. of years of existence – Existence upto 10 years", hasDetails: false },
  { sno: "4", label: "Should have received at least one round of equity investment from AIF / FVCI", hasDetails: true, detailsPlaceholder: "Last round of investment within 15 months? Please provide date of last round of equity investment…" },
  { sno: "5", label: "Should have aggregate non-exited / existing equity investment of at least ₹10 crore (which could be under multiple rounds from one or more AIFs / FVCIs)", hasDetails: true, detailsPlaceholder: "Provide details of equity investments…" },
  { sno: "6", label: "Operational income of at least ₹10 crore as per audited accounts in the last 2 financial years", hasDetails: false },
  { sno: "7", label: "Regular trend of revenue growth as reflected in income / sales of previous 12 months. For cyclical / seasonal business, comparison will be undertaken with corresponding previous period(s).", hasDetails: true, detailsPlaceholder: "Furnish details in the relevant column…" },
  { sno: "8", label: "Net worth of applicant company at least equal to the proposed assistance from SIDBI", hasDetails: true, detailsPlaceholder: "Please indicate net worth…" },
  { sno: "9", label: 'Should have positive Unit Economics. Unit economics shall be defined as "Contribution" (i.e. positive contribution per unit).', hasDetails: true, detailsPlaceholder: "Please furnish calculation…" },
  { sno: "10", label: "Should have in place cash flow projections (including cash margin / runway) for the period of proposed assistance with a suitable cushion of ~25%", hasDetails: true, detailsPlaceholder: "Please furnish cash flow projections…" },
  { sno: "11", label: "Promoter / founder of startup should have invested his / her own capital in the business", hasDetails: true, detailsPlaceholder: "Please furnish brief particulars…" },
  { sno: "12", label: "DER of upto 2:1 or cap on total debt as a % of Enterprise Valuation of 10%", hasDetails: true, detailsPlaceholder: "Please furnish calculation…" },
  { sno: "13", label: "Applicant's facility(s) has not been written off by AIFs / Units or restructured in last 2 years by Banks / FIs etc.", hasDetails: false },
  { sno: "14", label: "Applicant's facility is not running into stress or SMA category in Banks / AIFIs, etc. for last 12 months", hasDetails: false },
  { sno: "15", label: "Applicant does not have regular working capital limits with banks (except for OD / term loan against FDR or term loan / venture debt / structured debt, etc. from AIFs, NBFCs, etc. for working capital use)", hasDetails: false },
  { sno: "16", label: "Eligible Heads for financing – Loan / debt provided on co-financing basis may be utilized for funding working capital, capex for growth of the enterprise and other bona fide business purposes excluding repayment / refinancing of any debt / unsecured loan including Venture Debt or financing acquisitions / equity share purchase transactions.", hasDetails: false },
];

export const initEligibility = (): Record<string, EligibilityItem> => {
  const init: Record<string, EligibilityItem> = {};
  eligibilityParams.forEach((p) => {
    init[p.sno] = { value: false, details: "" };
  });
  return init;
};

type Props = {
  data: Record<string, EligibilityItem>;
  onChange: (sno: string, field: keyof EligibilityItem, value: string | boolean) => void;
  readOnly?: boolean;
};

const EligibilityCheck = ({ data, onChange, readOnly }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Eligibility Check / Compliance</CardTitle>
        <CardDescription>By Applicant / Partner AIF / IM</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-12">S.No</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Eligibility Parameter</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground w-24">Yes / No</th>
              </tr>
            </thead>
            <tbody>
              {eligibilityParams.map((p) => {
                return (
                  <tr key={p.sno} className="border-b last:border-b-0 align-top">
                    <td className="px-3 py-2.5 font-medium text-foreground">{p.sno}</td>
                    <td className="px-3 py-2.5 text-foreground leading-relaxed">
                      {p.label}

                      {/* Standard details fields */}
                      {p.hasDetails && data[p.sno]?.value && p.sno !== "3A" && (
                        p.sno === "2B" ? (
                          <div className="mt-2">
                            <Label className="text-xs text-muted-foreground mb-1 block">Upload ITR details</Label>
                            <div className="flex items-center gap-2">
                              <Upload className="h-4 w-4 text-muted-foreground" />
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="h-9 text-xs"
                                disabled={readOnly}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) onChange(p.sno, "details", file.name);
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <Textarea
                            value={data[p.sno]?.details || ""}
                            onChange={(e) => onChange(p.sno, "details", e.target.value)}
                            placeholder={p.detailsPlaceholder || "Provide details…"}
                            className="mt-2 min-h-[80px]"
                            disabled={readOnly}
                          />
                        )
                      )}

                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {p.sno === "3A" ? (
                        <Select
                          value={data[p.sno]?.details || ""}
                          onValueChange={(v) => {
                            onChange(p.sno, "details", v);
                            onChange(p.sno, "value", true);
                          }}
                          disabled={readOnly}
                        >
                          <SelectTrigger className="w-[100px] h-9 text-xs">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] bg-background z-50">
                            {YEAR_OPTIONS.map((year) => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={data[p.sno]?.value || false}
                            onCheckedChange={(v) => onChange(p.sno, "value", v)}
                            disabled={readOnly}
                          />
                          <Label className="text-xs w-6">{data[p.sno]?.value ? "Yes" : "No"}</Label>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EligibilityCheck;
