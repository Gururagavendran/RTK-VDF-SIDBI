import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload } from "lucide-react";

export type FacilityRow = {
  id: string;
  institution: string;
  facility: string;
  dateOfSanction: string;
  sanctionedAmount: string;
  outstanding: string;
  roiPercent: string;
  security: string;
  sanctionLetterFile?: string;
};

const emptyRow = (): FacilityRow => ({
  id: crypto.randomUUID(),
  institution: "",
  facility: "",
  dateOfSanction: "",
  sanctionedAmount: "",
  outstanding: "",
  roiPercent: "",
  security: "",
  sanctionLetterFile: "",
});

interface FacilitiesApplicantProps {
  rows: FacilityRow[];
  onChange: (rows: FacilityRow[]) => void;
  sanctionLetterFile?: string;
  onSanctionLetterChange?: (name: string) => void;
  readOnly?: boolean;
}

const FacilitiesApplicant = ({ rows, onChange, readOnly }: FacilitiesApplicantProps) => {
  const addRow = () => onChange([...rows, emptyRow()]);
  const removeRow = (id: string) =>
    rows.length > 1 ? onChange(rows.filter((r) => r.id !== id)) : undefined;
  const update = (id: string, field: keyof FacilityRow, value: string) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Facilities Availed by the Applicant</CardTitle>
        <CardDescription>
          Including borrowings / venture debt / non fund-based credit facilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Institution", "Facility", "Date of Sanction", "Sanct. Amt (₹ Cr)", "O/s (₹ Cr)", "RoI %", "Security", "Sanction Letter"].map(
                  (h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">
                      {h}
                    </th>
                  )
                )}
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-2 py-1.5">
                    <Input value={row.institution} onChange={(e) => update(row.id, "institution", e.target.value)} placeholder="Bank name" disabled={readOnly} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={row.facility} onChange={(e) => update(row.id, "facility", e.target.value)} placeholder="Facility type" disabled={readOnly} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input type="date" value={row.dateOfSanction} onChange={(e) => update(row.id, "dateOfSanction", e.target.value)} disabled={readOnly} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input type="text" inputMode="decimal" value={row.sanctionedAmount} onChange={(e) => update(row.id, "sanctionedAmount", e.target.value)} placeholder="0.00" disabled={readOnly} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input type="text" inputMode="decimal" value={row.outstanding} onChange={(e) => update(row.id, "outstanding", e.target.value)} placeholder="0.00" disabled={readOnly} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input type="text" inputMode="decimal" value={row.roiPercent} onChange={(e) => update(row.id, "roiPercent", e.target.value)} placeholder="0.00" disabled={readOnly} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={row.security} onChange={(e) => update(row.id, "security", e.target.value)} placeholder="Security details" disabled={readOnly} />
                  </td>
                  <td className="px-2 py-1.5">
                    {row.sanctionLetterFile ? (
                      <span className="text-xs text-muted-foreground truncate block max-w-[120px]" title={row.sanctionLetterFile}>{row.sanctionLetterFile}</span>
                    ) : !readOnly ? (
                      <div className="flex items-center gap-1">
                        <Upload className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="h-8 text-xs w-[120px]" onChange={(e) => { const f = e.target.files?.[0]; if (f) update(row.id, "sanctionLetterFile", f.name); }} />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(row.id)} disabled={rows.length === 1 || readOnly}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1 h-4 w-4" /> Add Row
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default FacilitiesApplicant;
export { emptyRow as emptyFacilityRow };
