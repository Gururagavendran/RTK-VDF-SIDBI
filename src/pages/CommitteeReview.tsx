import { useEffect, useState } from "react";
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
  getApplications, getApplicationById, applyWorkflowAction,
  type Application,
} from "@/lib/applicationStore";
import { getRegistrations } from "@/lib/registrationStore";
import {
  getMeetingsByType, updateMeetingStatus, simulateEmail,
  type CommitteeMeeting as MeetingType,
} from "@/lib/meetingStore";

const CommitteeReview = () => {
  const { type, meetingId } = useParams<{ type: string; meetingId?: string }>();
  const navigate = useNavigate();
  const session = getSession();
  const isICVD = type !== "ccic";
  const title = isICVD ? "IC-VD Committee Review" : "CCIC-CGM Committee Review";

  const [meetings, setMeetings] = useState<MeetingType[]>([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!session || session.userType !== "sidbi") {
      navigate("/login");
      return;
    }
    const role = session.sidbiRole;
    if (role !== "convenor" && role !== "committee_member") {
      navigate("/sidbi/dashboard");
      return;
    }
    let filtered = getMeetingsByType(isICVD ? "icvd" : "ccic").filter((m) => m.status === "scheduled");
    if (meetingId) filtered = filtered.filter((m) => m.id === meetingId);
    setMeetings(filtered);
  }, []);

  const handleRefer = (meeting: MeetingType) => {
    if (!comment.trim()) {
      toast({ title: "Comment Required", description: "Please add a comment.", variant: "destructive" });
      return;
    }

    const action = isICVD ? "icvd_committee_refer" : "ccic_committee_refer";

    meeting.applicationIds.forEach((appId) => {
      applyWorkflowAction(appId, action as any, {
        role: session?.sidbiRole ?? "convenor",
        id: session?.email ?? "convenor",
      }, {
        comment: `${isICVD ? "IC-VD" : "CCIC-CGM"} Committee reviewed and referred. ${comment}`,
      });
    });

    updateMeetingStatus(meeting.id, "completed", "referred");

    // Email simulation
    const recipients = isICVD
      ? ["maker@sidbi.com", "checker@sidbi.com", ...meeting.selectedMembers.map((m) => m.email)]
      : ["maker@sidbi.com", "checker@sidbi.com", ...meeting.selectedMembers.map((m) => m.email)];

    simulateEmail(
      recipients,
      `${isICVD ? "IC-VD" : "CCIC-CGM"} Review Completed`,
      `${meeting.applicationIds.length} application(s) have been referred for ${isICVD ? "further process (CCIC-CGM)" : "final approval"}.`
    );

    toast({
      title: `${isICVD ? "IC-VD" : "CCIC-CGM"} Review Complete`,
      description: `${meeting.applicationIds.length} application(s) referred for ${isICVD ? "CCIC-CGM review" : "final approval"}. Email sent to all participants.`,
    });

    navigate("/sidbi/dashboard");
  };

  const GovSectionHeader = ({ title: t }: { title: string }) => (
    <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
      <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">{t}</h2>
    </div>
  );

  return (
    <AppLayout
      title={`SIDBI — ${title}`}
      subtitle="Committee Review"
      backTo="/sidbi/dashboard"
      backLabel="Back to Dashboard"
      breadcrumbs={[
        { label: "Dashboard", href: "/sidbi/dashboard" },
        { label: title },
      ]}
      maxWidth="max-w-5xl"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {meetings.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center">
            <p className="text-muted-foreground">No scheduled {isICVD ? "IC-VD" : "CCIC-CGM"} meetings pending review.</p>
          </div>
        ) : (
          meetings.map((meeting) => {
            const meetingApps = meeting.applicationIds
              .map((id) => getApplicationById(id))
              .filter(Boolean) as Application[];

            return (
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
                      <p className="text-foreground">{meeting.selectedMembers.map((m) => m.name).join(", ")}</p>
                    </div>
                  </div>

                  {/* Team & Convenor Details */}
                  <div className="grid grid-cols-3 gap-4 text-sm border-t border-border pt-4">
                    <div>
                      <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Maker</span>
                      <p className="text-foreground">{meeting.makerEmail}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Checker</span>
                      <p className="text-foreground">{meeting.checkerEmail}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Convenor</span>
                      <p className="text-foreground">{meeting.convenorEmail}</p>
                    </div>
                  </div>

                  {/* Applications list */}
                  <Table className="gov-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>STAGE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetingApps.map((app, i) => (
                        <TableRow key={app.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium text-primary">Applicant {i + 1}: IC-VD note</TableCell>
                          <TableCell><GovStatusBadge status={app.stage} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Minutes of Meeting & Action */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    {session?.sidbiRole === "convenor" ? (
                      <div>
                        <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                          Upload Minutes of the Meeting <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-border file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-muted file:text-foreground hover:file:bg-accent cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                          Minutes of the Meeting
                        </Label>
                        <Button
                          variant="outline"
                          className="font-bold uppercase tracking-wider text-xs"
                        >
                          View / Download
                        </Button>
                      </div>
                    )}
                    <div className="flex justify-end gap-3">
                      {session?.sidbiRole === "convenor" ? (
                        <Button
                          className="font-bold uppercase tracking-wider text-xs"
                        >
                          Send to Committee for Consent
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="destructive"
                            className="font-bold uppercase tracking-wider text-xs"
                          >
                            No
                          </Button>
                          <Button
                            className="font-bold uppercase tracking-wider text-xs"
                          >
                            Yes
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
};

export default CommitteeReview;
