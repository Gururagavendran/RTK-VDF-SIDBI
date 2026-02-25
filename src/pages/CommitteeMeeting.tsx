import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Users, CheckCircle2, XCircle, Calendar as CalendarLucide } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/authStore";
import { toast } from "@/hooks/use-toast";
import { useGetApplicationsQuery, useApplyWorkflowActionMutation, useCreateMeetingMutation, useGetMeetingsQuery } from "@/store/api";
import type { WorkflowStep } from "@/lib/applicationStore";
import {
  COMMITTEE_MEMBERS_POOL, simulateEmail,
  type MeetingType, type CommitteeMember,
} from "@/lib/meetingStore";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import GovStatusBadge from "@/components/GovStatusBadge";

const CommitteeMeeting = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const session = getSession();
  const meetingType: MeetingType = type === "ccic" ? "ccic" : "icvd";

  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("10:00");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [subject, setSubject] = useState("");

  const { data: apps = [], refetch: refetchApps } = useGetApplicationsQuery(undefined);
  const { data: scheduledMeetings = [], refetch: refetchMeetings } = useGetMeetingsQuery({ type: meetingType });
  const [createMeetingMut] = useCreateMeetingMutation();
  const [applyAction] = useApplyWorkflowActionMutation();

  const isICVD = meetingType === "icvd";
  const title = isICVD ? "IC-VD Committee" : "CCIC-CGM Committee";
  const icvdEligibleSteps: WorkflowStep[] = ["icvd_maker_review", "icvd_checker_review", "icvd_convenor_scheduling", "icvd_committee_review"];
  const ccicEligibleSteps: WorkflowStep[] = ["ccic_maker_refine", "ccic_checker_review", "ccic_convenor_scheduling", "ccic_committee_review"];

  useEffect(() => {
    if (!session || session.userType !== "sidbi" || session.sidbiRole !== "convenor") {
      navigate("/login");
    }
  }, []);

  const eligibleApps = useMemo(() => {
    const steps = isICVD ? icvdEligibleSteps : ccicEligibleSteps;
    return apps.filter((a) => steps.includes(a.workflowStep as WorkflowStep));
  }, [apps, isICVD]);

  const meetingNumber = scheduledMeetings.length + 1;

  const toggleApp = (id: string) => {
    setSelectedApps((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSchedule = async () => {
    if (!date) { toast({ title: "Date Required", variant: "destructive" }); return; }
    if (selectedApps.length === 0) { toast({ title: "Applications Required", variant: "destructive" }); return; }

    const meeting = await createMeetingMut({
      type: meetingType,
      subject: subject || `${isICVD ? "IC-VD" : "CCIC-CGM"} Meeting #${meetingNumber}`,
      meetingNumber,
      dateTime: `${format(date, "yyyy-MM-dd")}T${time}:00`,
      totalMembers: COMMITTEE_MEMBERS_POOL,
      selectedMembers: COMMITTEE_MEMBERS_POOL,
      makerEmail: "maker@sidbi.com",
      checkerEmail: "checker@sidbi.com",
      convenorEmail: session?.email ?? "convenor@sidbi.com",
      approverEmail: isICVD ? undefined : "approving.authority@sidbi.com",
      applicationIds: selectedApps,
      status: "scheduled",
    }).unwrap();

    const action = isICVD ? "icvd_schedule_meeting" : "ccic_schedule_meeting";
    for (const appId of selectedApps) {
      await applyAction({
        id: appId, action: action as any,
        actor: { role: "convenor", id: session?.email ?? "convenor" },
        comment: `Scheduled for ${isICVD ? "IC-VD" : "CCIC-CGM"} Meeting #${meetingNumber} on ${format(date, "dd/MM/yyyy")} at ${time}`,
        meetingId: meeting.id,
      });
    }

    simulateEmail(
      ["sidbi-maker@demo.com", "sidbi-checker@demo.com", ...COMMITTEE_MEMBERS_POOL.map(m => m.email)],
      `${isICVD ? "IC-VD" : "CCIC-CGM"} Meeting #${meetingNumber} Scheduled`,
      `Meeting scheduled for ${format(date, "dd/MM/yyyy")} at ${time}. ${selectedApps.length} application(s) to review.`
    );

    toast({ title: "Meeting Scheduled", description: `${isICVD ? "IC-VD" : "CCIC-CGM"} Meeting #${meetingNumber} scheduled.` });
    setSelectedApps([]); setSubject(""); setDate(undefined); setTime("10:00");
  };

  const GovSectionHeader = ({ title: t }: { title: string }) => (
    <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
      <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">{t}</h2>
    </div>
  );

  return (
    <AppLayout title={`SIDBI — ${title}`} subtitle="Committee Meeting Scheduling" backTo="/sidbi/dashboard" backLabel="Back to Dashboard"
      breadcrumbs={[{ label: "Dashboard", href: "/sidbi/dashboard" }, { label: `${title} Meeting` }]} maxWidth="max-w-5xl">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="bg-card border border-border">
          <GovSectionHeader title={`${isICVD ? "IC-VD" : "CCIC-CGM"} Meeting #${meetingNumber}`} />
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-4 items-start">
              <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground pt-2">Sub:</Label>
              <Textarea placeholder={`${isICVD ? "IC-VD" : "CCIC-CGM"} Meeting Review #${meetingNumber}`} value={subject} onChange={(e) => setSubject(e.target.value)} className="min-h-[60px] resize-none" />
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Team:</Label>
              <Input value="sidbi-maker@demo.com, sidbi-checker@demo.com" readOnly className="bg-muted" />
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Committee Members:</Label>
              <Input value={COMMITTEE_MEMBERS_POOL.map(m => m.name).join(", ")} readOnly className="bg-muted" />
            </div>
            {!isICVD && (
              <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
                <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Approving Authority:</Label>
                <Input value="Shri G.K. Nair (CGM) — approving.authority@sidbi.com" readOnly className="bg-muted" />
              </div>
            )}
            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Date & Time:</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "DD/MM/YYYY"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-[130px]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border">
          <div className="gov-section-header bg-muted px-6 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">Applications</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Forwarded: <span className="font-bold text-foreground">{eligibleApps.length}</span></span>
              <span className="text-xs text-muted-foreground">Selected: <span className="font-bold text-primary">{selectedApps.length}</span></span>
            </div>
          </div>
          <div className="p-6">
            {eligibleApps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No applications awaiting {isICVD ? "IC-VD" : "CCIC-CGM"} committee scheduling.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-muted border-b border-border">
                  <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-wide text-muted-foreground w-16">Select</th>
                  <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-wide text-muted-foreground">Applicants</th>
                </tr></thead>
                <tbody>
                  {eligibleApps.map((app, idx) => (
                    <tr key={app.id} className={cn("border-b border-border cursor-pointer transition-all", idx % 2 === 0 ? "bg-muted/40" : "bg-card", selectedApps.includes(app.id) && "bg-primary/5")} onClick={() => toggleApp(app.id)}>
                      <td className="px-4 py-3"><Checkbox checked={selectedApps.includes(app.id)} /></td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-primary underline cursor-pointer hover:text-primary/80" onClick={(e) => { e.stopPropagation(); navigate(`/sidbi/review/${app.id}?back=/sidbi/meeting/${type}`); }}>
                          Applicant {idx + 1}: IC-VD note
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSchedule} className="font-bold uppercase tracking-wider text-xs px-8 py-3" disabled={eligibleApps.length === 0}>
            <CalendarLucide className="h-4 w-4 mr-2" /> Schedule Meeting
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CommitteeMeeting;
