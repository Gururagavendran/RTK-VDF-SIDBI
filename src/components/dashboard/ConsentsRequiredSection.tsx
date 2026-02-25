import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CommitteeMeeting as MeetingRecord } from "@/lib/meetingStore";

interface Props {
  meetings: MeetingRecord[];
}

const ConsentsRequiredSection = ({ meetings }: Props) => {
  const { toast } = useToast();

  // Build consent rows from all meetings
  const consentRows = meetings.flatMap((m) =>
    m.applicationIds.map((appId, idx) => ({
      appId,
      meetingId: m.id,
      key: `${m.id}-${appId}`,
      globalIdx: idx,
    }))
  );

  const [consents, setConsents] = useState<Record<string, "yes" | "no" | null>>(
    () => Object.fromEntries(consentRows.map(r => [r.key, null]))
  );

  const handleConsent = (key: string, value: "yes" | "no") => {
    setConsents(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const pending = consentRows.filter(r => consents[r.key] === null);
    if (pending.length > 0) {
      toast({ title: "Incomplete", description: "Please provide consent for all applicants before submitting.", variant: "destructive" });
      return;
    }
    toast({ title: "Consent Submitted", description: "Your consent has been recorded successfully." });
  };

  if (consentRows.length === 0) {
    return (
      <div className="bg-card border border-border">
        <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
          <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">Consents Required</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No consents required at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border">
      <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
        <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">Consents Required</h2>
      </div>
      <Table className="gov-table">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>APPLICANT EMAIL</TableHead>
            <TableHead>LINKED IC-VD NOTE</TableHead>
            <TableHead>CONSENT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consentRows.map((row, i) => (
            <TableRow key={row.key}>
              <TableCell className="font-medium">{i + 1}</TableCell>
              <TableCell className="text-sm">applicant{i + 1}@demo.com</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="text-xs font-bold uppercase gap-1">
                  <Download className="h-3 w-3" /> Download
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={consents[row.key] === "yes" ? "default" : "outline"}
                    className={`text-xs font-bold uppercase h-7 px-3 ${consents[row.key] === "yes" ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => handleConsent(row.key, "yes")}
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant={consents[row.key] === "no" ? "destructive" : "outline"}
                    className="text-xs font-bold uppercase h-7 px-3"
                    onClick={() => handleConsent(row.key, "no")}
                  >
                    No
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="px-6 py-4 border-t border-border flex justify-end">
        <Button className="text-xs font-bold uppercase" onClick={handleSubmit}>
          Submit Consent
        </Button>
      </div>
    </div>
  );
};

export default ConsentsRequiredSection;
