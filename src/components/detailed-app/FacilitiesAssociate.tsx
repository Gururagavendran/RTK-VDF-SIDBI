import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, Upload, X } from "lucide-react";

export type AssocFacilityRow = {
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

export type Concern = {
  id: string;
  name: string;
  rows: AssocFacilityRow[];
};

const emptyAssocRow = (): AssocFacilityRow => ({
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

const emptyConcern = (): Concern => ({
  id: crypto.randomUUID(),
  name: "",
  rows: [emptyAssocRow()],
});

interface FacilitiesAssociateProps {
  concerns: Concern[];
  onChange: (concerns: Concern[]) => void;
  sanctionLetterFile?: string;
  onSanctionLetterChange?: (name: string) => void;
  readOnly?: boolean;
}

const FacilitiesAssociate = ({ concerns, onChange, readOnly }: FacilitiesAssociateProps) => {
  const addConcern = () => onChange([...concerns, emptyConcern()]);
  const removeConcern = (id: string) =>
    concerns.length > 1 ? onChange(concerns.filter((c) => c.id !== id)) : undefined;

  const updateConcernName = (id: string, name: string) =>
    onChange(concerns.map((c) => (c.id === id ? { ...c, name } : c)));

  const updateRows = (concernId: string, rows: AssocFacilityRow[]) =>
    onChange(concerns.map((c) => (c.id === concernId ? { ...c, rows } : c)));

  const addRow = (concernId: string) => {
    const c = concerns.find((x) => x.id === concernId);
    if (c) updateRows(concernId, [...c.rows, emptyAssocRow()]);
  };

  const removeRow = (concernId: string, rowId: string) => {
    const c = concerns.find((x) => x.id === concernId);
    if (c && c.rows.length > 1) updateRows(concernId, c.rows.filter((r) => r.id !== rowId));
  };

  const updateField = (concernId: string, rowId: string, field: keyof AssocFacilityRow, value: string) => {
    const c = concerns.find((x) => x.id === concernId);
    if (c) updateRows(concernId, c.rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)));
  };

  const headers = ["Institution", "Facility", "Date of Sanction", "Sanct. Amt (₹ Cr)", "O/s (₹ Cr)", "RoI %", "Security", "Sanction Letter"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Facilities Availed by Associate Concern(s)</CardTitle>
        <CardDescription>Add each associate concern separately</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {concerns.map((concern, idx) => (
          <div key={concern.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  value={concern.name}
                  onChange={(e) => updateConcernName(concern.id, e.target.value)}
                  placeholder={`Name of Concern ${idx + 1}`}
                  className="font-medium"
                  disabled={readOnly}
                />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeConcern(concern.id)} disabled={concerns.length === 1 || readOnly}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                    <th className="px-3 py-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {concern.rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="px-2 py-1.5"><Input value={row.institution} onChange={(e) => updateField(concern.id, row.id, "institution", e.target.value)} placeholder="Bank name" disabled={readOnly} /></td>
                      <td className="px-2 py-1.5"><Input value={row.facility} onChange={(e) => updateField(concern.id, row.id, "facility", e.target.value)} placeholder="Facility type" disabled={readOnly} /></td>
                      <td className="px-2 py-1.5"><Input type="date" value={row.dateOfSanction} onChange={(e) => updateField(concern.id, row.id, "dateOfSanction", e.target.value)} disabled={readOnly} /></td>
                      <td className="px-2 py-1.5"><Input type="text" inputMode="decimal" value={row.sanctionedAmount} onChange={(e) => updateField(concern.id, row.id, "sanctionedAmount", e.target.value)} placeholder="0.00" disabled={readOnly} /></td>
                      <td className="px-2 py-1.5"><Input type="text" inputMode="decimal" value={row.outstanding} onChange={(e) => updateField(concern.id, row.id, "outstanding", e.target.value)} placeholder="0.00" disabled={readOnly} /></td>
                      <td className="px-2 py-1.5"><Input type="text" inputMode="decimal" value={row.roiPercent} onChange={(e) => updateField(concern.id, row.id, "roiPercent", e.target.value)} placeholder="0.00" disabled={readOnly} /></td>
                      <td className="px-2 py-1.5"><Input value={row.security} onChange={(e) => updateField(concern.id, row.id, "security", e.target.value)} placeholder="Security details" disabled={readOnly} /></td>
                      <td className="px-2 py-1.5">
                        {row.sanctionLetterFile ? (
                          <span className="text-xs text-muted-foreground truncate block max-w-[120px]" title={row.sanctionLetterFile}>{row.sanctionLetterFile}</span>
                        ) : !readOnly ? (
                          <div className="flex items-center gap-1">
                            <Upload className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="h-8 text-xs w-[120px]" onChange={(e) => { const f = e.target.files?.[0]; if (f) updateField(concern.id, row.id, "sanctionLetterFile", f.name); }} />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(concern.id, row.id)} disabled={concern.rows.length === 1 || readOnly}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!readOnly && (
              <Button type="button" variant="outline" size="sm" onClick={() => addRow(concern.id)}>
                <Plus className="mr-1 h-4 w-4" /> Add Row
              </Button>
            )}
          </div>
        ))}
        {!readOnly && (
          <Button type="button" variant="outline" onClick={addConcern}>
            <Plus className="mr-1 h-4 w-4" /> Add Concern
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default FacilitiesAssociate;
export { emptyConcern, emptyAssocRow };
