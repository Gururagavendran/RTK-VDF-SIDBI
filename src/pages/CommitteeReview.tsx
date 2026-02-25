import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AppLayout from "@/components/layout/AppLayout";
import GovStatusBadge from "@/components/GovStatusBadge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/authStore";
import { toast } from "@/hooks/use-toast";
import {
  useGetMeetingsQuery,
  useGetApplicationByIdQuery,
  useApplyWorkflowActionMutation,
  useUpdateMeetingStatusMutation,
} from "@/store/api";
import { simulateEmail } from "@/lib/meetingStore";
import type { Application } from "@/lib/applicationStore";

const CommitteeReview = () => {
  const { type, meetingId } = useParams<{ type: string; meetingId?: string }>();
  const navigate = useNavigate();
  const session = getSession();
  const isICVD = type !== "ccic";
  const title = isICVD ? "IC-VD Committee Review" : "CCIC-CGM Committee Review";

  const { data: allMeetings = [] } = useGetMeetingsQuery({ type: isICVD ? "icvd" : "ccic" });
  const [applyAction] = useApplyWorkflowActionMutation();
  const [updateStatus] = useUpdateMeetingStatusMutation();
  const [comment, setComment] = useState("");

  const meetings = allMeetings.filter(m => {
    if (m.status !== "scheduled") return false;
    if (meetingId) return m.id === meetingId;
    return true;
  });

  const handleRefer = async (meeting: typeof meetings[0]) => {
    if (!comment.trim()) {
      toast({ title: "Comment Required", variant: "destructive" });
      return;
    }

    const action = isICVD ? "icvd_committee_refer" : "ccic_committee_refer";
    for (const appId of meeting.applicationIds) {
      await applyAction({
        id: appId, action: action as any,
        actor: { role: session?.sidbiRole ?? "convenor", id: session?.email ?? "convenor" },
        comment: `${isICVD ? "IC-VD" : "CCIC-CGM"} Committee reviewed and referred. ${comment}`,
      });
    }

    await updateStatus({ id: meeting.id, status: "completed", outcome: "referred" });

    simulateEmail(
      ["maker@sidbi.com", "checker@sidbi.com", ...meeting.selectedMembers.map(m => m.email)],
      `${isICVD ? "IC-VD" : "CCIC-CGM"} Review Completed`,
      `${meeting.applicationIds.length} application(s) referred.`
    );

    toast({ title: `${isICVD ? "IC-VD" : "CCIC-CGM"} Review Complete` });
    navigate("/sidbi/dashboard");
  };

  const GovSectionHeader = ({ title: t }: { title: string }) => (
    <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
      <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">{t}</h2>
    </div>
  );

  return (
    <AppLayout title={`SIDBI — ${title}`} subtitle="Committee Review" backTo="/sidbi/dashboard" backLabel="Back to Dashboard"
      breadcrumbs={[{ label: "Dashboard", href: "/sidbi/dashboard" }, { label: title }]} maxWidth="max-w-5xl">
      <div className="mx-auto max-w-5xl space-y-6">
        {meetings.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center">
            <p className="text-muted-foreground">No scheduled {isICVD ? "IC-VD" : "CCIC-CGM"} meetings pending review.</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id} className="bg-card border border-border">
              <GovSectionHeader title={meeting.subject} />
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Date & Time</span>
                    <p className="text-foreground">{new Date(meeting.dateTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Members</span>
                    <p className="text-foreground">{meeting.selectedMembers.map(m => m.name).join(", ")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm border-t border-border pt-4">
                  <div><span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Maker</span><p className="text-foreground">{meeting.makerEmail}</p></div>
                  <div><span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Checker</span><p className="text-foreground">{meeting.checkerEmail}</p></div>
                  <div><span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Convenor</span><p className="text-foreground">{meeting.convenorEmail}</p></div>
                </div>
                <Table className="gov-table">
                  <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Applicants</TableHead><TableHead>STAGE</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {meeting.applicationIds.map((appId, i) => (
                      <TableRow key={appId}><TableCell>{i + 1}</TableCell><TableCell className="font-medium text-primary">Applicant {i + 1}: IC-VD note</TableCell><TableCell><GovStatusBadge status={isICVD ? "icvd" : "ccic"} /></TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="space-y-3 pt-4 border-t border-border">
                  {session?.sidbiRole === "convenor" ? (
                    <div>
                      <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Upload Minutes of the Meeting <span className="text-destructive">*</span></Label>
                      <input type="file" accept=".pdf,.doc,.docx" className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-border file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-muted file:text-foreground hover:file:bg-accent cursor-pointer" />
                    </div>
                  ) : (
                    <div><Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Minutes of the Meeting</Label><Button variant="outline" className="font-bold uppercase tracking-wider text-xs">View / Download</Button></div>
                  )}
                  <div className="flex justify-end gap-3">
                    {session?.sidbiRole === "convenor" ? (
                      <Button className="font-bold uppercase tracking-wider text-xs">Send to Committee for Consent</Button>
                    ) : (
                      <><Button variant="destructive" className="font-bold uppercase tracking-wider text-xs">No</Button><Button className="font-bold uppercase tracking-wider text-xs">Yes</Button></>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default CommitteeReview;
