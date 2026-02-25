import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import { getApplications } from "@/lib/applicationStore";
import { getRegistrations } from "@/lib/registrationStore";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users } from "lucide-react";

const stepLabel = (step: string) => {
  const labels: Record<string, string> = {
    prelim_submitted: "Prelim Submitted",
    prelim_revision: "Prelim – Revision Requested",
    prelim_rejected: "Prelim – Rejected",
    detailed_form_open: "Detailed Form Open",
    detailed_revision: "Detailed – Revision Requested",
    detailed_maker_review: "Detailed – Under Review",
    detailed_checker_review: "Detailed – Checker Review",
    detailed_rejected: "Detailed – Rejected",
    icvd_note_preparation: "IC-VD Note Preparation",
    icvd_checker_review: "IC-VD Checker Review",
    icvd_committee_review: "IC-VD Committee Review",
    ccic_note_preparation: "CCIC Note Preparation",
    ccic_checker_review: "CCIC Checker Review",
    ccic_committee_review: "CCIC Committee Review",
    final_approval: "Final Approval",
    final_rejected: "Final – Rejected",
    sanctioned: "Sanctioned",
    completed: "Completed",
  };
  return labels[step] || step;
};

const stepVariant = (step: string): "default" | "secondary" | "destructive" | "outline" => {
  if (step.includes("rejected")) return "destructive";
  if (step === "sanctioned" || step === "completed") return "default";
  if (step.includes("revision")) return "outline";
  return "secondary";
};

const regStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "outline";
};

const PublicData = () => {
  const applications = getApplications();
  const registrations = getRegistrations();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GovHeader showNav={true} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-2xl font-bold text-primary mb-1">Public Data</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Overview of all registrations and applications submitted on the platform.
          </p>

          <Tabs defaultValue="applications" className="space-y-4">
            <TabsList>
              <TabsTrigger value="applications" className="gap-1.5">
                <FileText className="h-4 w-4" /> Applications ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="registrations" className="gap-1.5">
                <Users className="h-4 w-4" /> Registrations ({registrations.length})
              </TabsTrigger>
            </TabsList>

            {/* Applications Tab */}
            <TabsContent value="applications">
              <div className="border border-border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">S.No</TableHead>
                      <TableHead className="font-semibold">Application ID</TableHead>
                      <TableHead className="font-semibold">Applicant</TableHead>
                      <TableHead className="font-semibold">Company Name</TableHead>
                      <TableHead className="font-semibold">Stage</TableHead>
                      <TableHead className="font-semibold">Workflow Status</TableHead>
                      <TableHead className="font-semibold">Submitted</TableHead>
                      <TableHead className="font-semibold">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                          No applications found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((app, idx) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{idx + 1}</TableCell>
                          <TableCell className="font-mono text-xs">{app.id.slice(0, 8)}…</TableCell>
                          <TableCell>{app.applicantEmail}</TableCell>
                          <TableCell>{app.prelimData?.companyName || app.prelimData?.nameOfApplicant || "—"}</TableCell>
                          <TableCell className="capitalize">{app.stage}</TableCell>
                          <TableCell>
                            <Badge variant={stepVariant(app.workflowStep)}>
                              {stepLabel(app.workflowStep)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(app.submittedAt).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(app.updatedAt).toLocaleDateString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Registrations Tab */}
            <TabsContent value="registrations">
              <div className="border border-border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">S.No</TableHead>
                      <TableHead className="font-semibold">Applicant Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">PAN No.</TableHead>
                      <TableHead className="font-semibold">GST No.</TableHead>
                      <TableHead className="font-semibold">MSME Status</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                          No registrations found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrations.map((reg, idx) => (
                        <TableRow key={reg.id}>
                          <TableCell className="font-medium">{idx + 1}</TableCell>
                          <TableCell>{reg.nameOfApplicant}</TableCell>
                          <TableCell>{reg.email}</TableCell>
                          <TableCell className="font-mono text-xs">{reg.panNo}</TableCell>
                          <TableCell className="font-mono text-xs">{reg.gstNo}</TableCell>
                          <TableCell className="capitalize">{reg.msmeStatus}</TableCell>
                          <TableCell>
                            <Badge variant={regStatusVariant(reg.status)}>
                              {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(reg.submittedAt).toLocaleDateString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <GovFooter />
    </div>
  );
};

export default PublicData;
