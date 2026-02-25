import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import GovStatusBadge from "@/components/GovStatusBadge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useGetApplicationsQuery, useGetMeetingsQuery } from "@/store/api";
import { getSession } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import { Eye, FileText, Clock, CheckCircle2, XCircle, Shield, ArrowUpDown, Calendar, Users, Share2, Printer, Download, Send } from "lucide-react";
import type { Application } from "@/lib/applicationStore";
import type { CommitteeMeeting as MeetingRecord } from "@/lib/meetingStore";
import ConsentsRequiredSection from "@/components/dashboard/ConsentsRequiredSection";

const roleLabels: Record<string, string> = {
  maker: "Maker", checker: "Checker", convenor: "Convenor",
  committee_member: "Committee Member", approving_authority: "Approving Authority",
};

const statusLabelMap: Record<string, string> = {
  recommend_pursual: "RECOMMENDED FOR APPROVAL",
  recommend_rejection: "RECOMMENDED FOR REJECTION",
  recommended_for_approval: "RECOMMENDED FOR APPROVAL",
  recommended_for_rejection: "RECOMMENDED FOR REJECTION",
  pending_review: "SUBMITTED",
  under_review: "UNDER REVIEW",
};
const statusLabel = (s: string) => statusLabelMap[s] || s.replace(/_/g, " ").toUpperCase();

const workflowStepLabelMap: Record<string, string> = {
  prelim_submitted: "Prelim Appl. Submitted for Review",
  prelim_review: "Prelim Appl. Under Review",
  prelim_revision: "Prelim Appl. Reverted Back to Applicant",
  prelim_rejected: "Prelim Appl. Rejected",
  detailed_form_open: "Detailed Appl. Form Pending from Applicant",
  detailed_form: "Detailed Appl. Form Pending from Applicant",
  detailed_revision: "Detailed Appl. Reverted Back to Applicant",
  detailed_maker_review: "Detailed Appl. Under Maker Review",
  detailed_checker_review: "Detailed Appl. Under Checker Review",
  detailed_rejected: "Detailed Appl. Rejected",
  icvd_maker_review: "IC-VD Note Under Maker Preparation",
  icvd_note_preparation: "IC-VD Note Under Maker Preparation",
  icvd_checker_review: "IC-VD Note Under Checker Review",
  icvd_convenor_scheduling: "IC-VD Meeting Being Scheduled by Convenor",
  icvd_committee_review: "IC-VD Committee Review in Progress",
  icvd_referred: "IC-VD Referred to CCIC-CGM",
  ccic_maker_refine: "CCIC-CGM Note Under Maker Preparation",
  ccic_note_preparation: "CCIC-CGM Note Under Maker Preparation",
  ccic_checker_review: "CCIC-CGM Note Under Checker Review",
  ccic_convenor_scheduling: "CCIC-CGM Meeting Being Scheduled by Convenor",
  ccic_committee_review: "CCIC-CGM Committee Review in Progress",
  ccic_referred: "CCIC-CGM Referred to Final Approval",
  final_approval: "Pending Final Approval by Approving Authority",
  final_rejected: "Rejected at Final Approval Stage",
  sanctioned: "Sanctioned",
  completed: "Completed",
};
const workflowStepLabel = (s: string) => workflowStepLabelMap[s] || s.replace(/_/g, " ").toUpperCase();

type StatFilter = "all" | "pending" | "approved" | "rejected";

const SidbiDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = getSession();
  const [statFilter, setStatFilter] = useState<StatFilter>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const { data: apps = [], isLoading } = useGetApplicationsQuery(
    session?.sidbiRole ? { role: session.sidbiRole } : undefined,
    { skip: !session || session.userType !== "sidbi" }
  );

  const showMeetings = session?.sidbiRole === "convenor" || session?.sidbiRole === "committee_member";
  const { data: scheduledMeetings = [] } = useGetMeetingsQuery(undefined, { skip: !showMeetings });

  useEffect(() => {
    if (!session || session.userType !== "sidbi") { navigate("/login"); return; }
  }, []);

  const roleName = roleLabels[session?.sidbiRole ?? "maker"] ?? "Maker";
  const pending = apps.filter(a => a.status === "submitted" || a.status === "pending_review").length;
  const approved = apps.filter(a => a.status === "approved").length;
  const rejected = apps.filter(a => a.status === "rejected").length;

  const filteredApps = useMemo(() => {
    let result = [...apps];
    if (statFilter === "pending") result = result.filter(a => a.status === "submitted" || a.status === "pending_review");
    else if (statFilter === "approved") result = result.filter(a => a.status === "approved");
    else if (statFilter === "rejected") result = result.filter(a => a.status === "rejected");
    if (stageFilter !== "all") result = result.filter(a => a.stage === stageFilter);
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter);
    result.sort((a, b) => {
      const diff = new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      return sortOrder === "desc" ? diff : -diff;
    });
    return result;
  }, [apps, statFilter, stageFilter, statusFilter, sortOrder]);

  const uniqueStages = [...new Set(apps.map(a => a.stage))];
  const uniqueStatuses = [...new Set(apps.map(a => a.status))];

  const statCards = [
    { label: "TOTAL", value: apps.length, icon: FileText, className: "border-l-4 border-primary", filter: "all" as StatFilter },
    { label: "PENDING ACTION", value: pending, icon: Clock, className: "border-l-4 border-warning", filter: "pending" as StatFilter },
    { label: "APPROVED", value: approved, icon: CheckCircle2, className: "border-l-4 border-success", filter: "approved" as StatFilter },
    { label: "REJECTED", value: rejected, icon: XCircle, className: "border-l-4 border-destructive", filter: "rejected" as StatFilter },
  ];

  return (
    <AppLayout
      title={`SIDBI — ${roleName}`}
      subtitle="Internal Review Portal"
      noPadding
      headerChildren={
        <span className="gov-badge bg-secondary/10 text-secondary border-secondary">
          <Shield className="h-3 w-3 mr-1" /> {roleName}
        </span>
      }
    >
      <div className="flex-1">
        <main className="p-6 space-y-6">
          <div className="gov-section-header flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground uppercase tracking-wider">{roleName} Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Review and process venture debt applications from MSME enterprises.</p>
            </div>
          {session?.sidbiRole === "convenor" && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs font-bold uppercase"
                  onClick={() => navigate("/sidbi/meeting/icvd")}>
                  <Calendar className="h-3 w-3 mr-1" /> IC-VD Meeting
                </Button>
                <Button variant="outline" size="sm" className="text-xs font-bold uppercase"
                  onClick={() => navigate("/sidbi/meeting/ccic")}>
                  <Calendar className="h-3 w-3 mr-1" /> CCIC-CGM Meeting
                </Button>
              </div>
            )}
          {session?.sidbiRole === "committee_member" && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs font-bold uppercase"
                  onClick={() => navigate("/sidbi/meetings/icvd")}>
                  <Calendar className="h-3 w-3 mr-1" /> IC-VD Review
                </Button>
                <Button variant="outline" size="sm" className="text-xs font-bold uppercase"
                  onClick={() => navigate("/sidbi/meetings/ccic")}>
                  <Calendar className="h-3 w-3 mr-1" /> CCIC-CG Review
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, className, filter }) => (
              <div key={label}
                className={`bg-card border border-border p-5 flex items-center gap-4 cursor-pointer transition-all ${className} ${statFilter === filter ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"}`}
                onClick={() => setStatFilter(statFilter === filter ? "all" : filter)}
              >
                <Icon className="h-6 w-6 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {session?.sidbiRole !== "committee_member" && (
          <div className="bg-card border border-border">
            <div className="gov-section-header bg-muted px-6 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">All Applications</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{filteredApps.length} of {apps.length} application{apps.length !== 1 ? "s" : ""}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")} title="Sort by date">
                <ArrowUpDown className="h-3 w-3 mr-1" /> Date
              </Button>
            </div>

            {isLoading ? (
              <div className="py-16 text-center"><p className="text-muted-foreground">Loading…</p></div>
            ) : filteredApps.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-semibold">{apps.length === 0 ? "No applications submitted yet" : "No matching applications"}</p>
                <p className="text-muted-foreground text-sm mt-1">{apps.length === 0 ? "Applications from enterprises will appear here once submitted." : "Try adjusting your filters."}</p>
              </div>
            ) : (
              <Table className="gov-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>APPLICANT NAME</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")}>
                      SUBMITTED <ArrowUpDown className="inline h-3 w-3 ml-1" />
                    </TableHead>
                    <TableHead>
                      <Select value={stageFilter} onValueChange={setStageFilter}>
                        <SelectTrigger className="h-7 w-[110px] text-xs font-medium border-none bg-transparent shadow-none px-0">
                          <SelectValue placeholder="STAGE" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="all">ALL STAGES</SelectItem>
                          {uniqueStages.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableHead>
                    <TableHead>WORKFLOW STEP</TableHead>
                    <TableHead>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-7 w-[130px] text-xs font-medium border-none bg-transparent shadow-none px-0">
                          <SelectValue placeholder="STATUS" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="all">ALL STATUSES</SelectItem>
                          {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app, idx) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell className="text-sm">Applicant {idx + 1}</TableCell>
                      <TableCell className="text-sm">{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell><GovStatusBadge status={app.stage} /></TableCell>
                      <TableCell>
                        <span className="gov-badge bg-muted text-muted-foreground border-border">
                          {workflowStepLabel(app.workflowStep ?? "prelim_submitted")}
                        </span>
                      </TableCell>
                      <TableCell><GovStatusBadge status={app.status} stage={app.stage} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8 border-primary text-primary"
                            onClick={() => navigate(`/sidbi/review/${app.id}`)} title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 border-muted-foreground text-muted-foreground"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/sidbi/review/${app.id}`);
                              toast({ title: "Link Copied", description: "Application link copied to clipboard for sharing." });
                            }} title="Share">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 border-muted-foreground text-muted-foreground"
                            onClick={() => {
                              const printUrl = `/sidbi/review/${app.id}`;
                              const printWindow = window.open(printUrl, '_blank');
                              if (printWindow) {
                                printWindow.addEventListener('load', () => printWindow.print());
                              }
                            }} title="Print">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          )}

          {(session?.sidbiRole === "convenor" || session?.sidbiRole === "committee_member") && (
            <div id="meetings-scheduled-section" className="bg-card border border-border">
              <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">Meetings Scheduled</h2>
              </div>
              {scheduledMeetings.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No meetings scheduled yet.</p>
                </div>
              ) : (
                <Table className="gov-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>MEETING ID</TableHead>
                      <TableHead>MEETING NAME</TableHead>
                      <TableHead>SCHEDULED</TableHead>
                      <TableHead>COMPLETED</TableHead>
                      <TableHead>CONSENT PROVIDED</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledMeetings.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-xs">{m.id.slice(0, 8)}</TableCell>
                        <TableCell className="font-medium">{m.subject}</TableCell>
                        <TableCell>{new Date(m.dateTime).toLocaleString()}</TableCell>
                        <TableCell>
                          <GovStatusBadge status={m.status === "completed" ? "approved" : "pending_review"} />
                        </TableCell>
                        <TableCell>
                          <GovStatusBadge status={m.outcome ? "approved" : "pending_review"} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold uppercase"
                            onClick={() => navigate(`/sidbi/committee-review/${m.type}/${m.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {session?.sidbiRole === "convenor" && (
            <div className="bg-card border border-border">
              <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">Consents Received</h2>
              </div>
              {(() => {
                const consentRows = scheduledMeetings.flatMap((m) =>
                  m.applicationIds.map((appId, idx) => {
                    const votesForApp = m.votes;
                    const yesCount = votesForApp.filter(v => v.vote === "approve").length;
                    const noCount = votesForApp.filter(v => v.vote === "reject").length;
                    const total = votesForApp.length;
                    const yesWins = yesCount > noCount;
                    const hasVotes = total > 0;
                    return { appId, meetingId: m.id, meetingType: m.type, idx, total, yesCount, noCount, yesWins, hasVotes };
                  })
                );
                if (consentRows.length === 0) {
                  return (
                    <div className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">No consent data available yet.</p>
                    </div>
                  );
                }
                return (
                  <Table className="gov-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>APPLICANT EMAIL</TableHead>
                        <TableHead>IC-VD NOTE</TableHead>
                        <TableHead>CONSENTS RECEIVED</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consentRows.map((row, i) => (
                        <TableRow key={`${row.meetingId}-${row.appId}`}>
                          <TableCell className="font-medium">{i + 1}</TableCell>
                          <TableCell className="text-sm">applicant{i + 1}@demo.com</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="text-xs font-bold uppercase gap-1">
                              <Download className="h-3 w-3" /> Download
                            </Button>
                          </TableCell>
                          <TableCell>
                          {row.hasVotes ? (
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${row.yesWins ? "bg-success/10 border-success text-success" : "bg-destructive/10 border-destructive text-destructive"}`}>
                                <span>Total: {row.yesCount + row.noCount}/{row.total}</span>
                                <span>|</span>
                                <span>Yes: {row.yesCount}</span>
                                <span>|</span>
                                <span>No: {row.noCount}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Pending</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" className="text-xs font-bold uppercase gap-1" disabled={!(row.hasVotes && row.yesWins)}>
                              <Send className="h-3 w-3" /> Send to Maker
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              })()}
            </div>
          )}

          {session?.sidbiRole === "committee_member" && (
            <ConsentsRequiredSection meetings={scheduledMeetings} />
          )}
        </main>
      </div>
    </AppLayout>
  );
};

export default SidbiDashboard;
