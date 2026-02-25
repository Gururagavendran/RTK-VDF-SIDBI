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
import { useGetApplicationsQuery, useDeleteApplicationMutation } from "@/store/api";
import { getSession } from "@/lib/authStore";
import { toast } from "@/hooks/use-toast";
import { Plus, Eye, Trash2, FileText, Clock, CheckCircle2, XCircle, ArrowUpDown } from "lucide-react";
import type { Application } from "@/lib/applicationStore";

const statusLabelMap: Record<string, string> = {
  recommend_pursual: "RECOMMENDED FOR APPROVAL",
  recommend_rejection: "RECOMMENDED FOR REJECTION",
  recommended_for_approval: "RECOMMENDED FOR APPROVAL",
  recommended_for_rejection: "RECOMMENDED FOR REJECTION",
  pending_review: "SUBMITTED",
  under_review: "UNDER REVIEW",
};
const statusLabel = (s: string) => statusLabelMap[s] || s.replace(/_/g, " ").toUpperCase();

type StatFilter = "all" | "active" | "approved" | "rejected";

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [statFilter, setStatFilter] = useState<StatFilter>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const { data: apps = [], isLoading, refetch } = useGetApplicationsQuery(
    session ? { email: session.email } : undefined,
    { skip: !session || session.userType !== "applicant" }
  );
  const [deleteApp] = useDeleteApplicationMutation();

  useEffect(() => {
    if (!session || session.userType !== "applicant") { navigate("/login"); return; }
  }, []);

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [refetch]);

  const active = apps.filter(a => !["approved", "rejected"].includes(a.status)).length;
  const approved = apps.filter(a => a.status === "approved").length;
  const rejected = apps.filter(a => a.status === "rejected").length;

  const filteredApps = useMemo(() => {
    let result = [...apps];
    if (statFilter === "active") result = result.filter(a => !["approved", "rejected"].includes(a.status));
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
    { label: "IN PROGRESS", value: active, icon: Clock, className: "border-l-4 border-warning", filter: "active" as StatFilter },
    { label: "APPROVED", value: approved, icon: CheckCircle2, className: "border-l-4 border-success", filter: "approved" as StatFilter },
    { label: "REJECTED", value: rejected, icon: XCircle, className: "border-l-4 border-destructive", filter: "rejected" as StatFilter },
  ];

  if (isLoading) {
    return (
      <AppLayout title="SIDBI — Applicant Portal" subtitle="Venture Debt Application System" noPadding>
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading applications…</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="SIDBI — Applicant Portal" subtitle="Venture Debt Application System" noPadding>
      <div className="flex-1">
        <main className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="gov-section-header">
              <h1 className="text-xl font-bold text-foreground uppercase tracking-wider">My Applications</h1>
              <p className="text-sm text-muted-foreground mt-1">Track and manage your venture debt financing applications.</p>
            </div>
            <Button className="font-bold uppercase tracking-wider text-xs shrink-0" onClick={() => navigate("/prelim-application")}>
              <Plus className="h-4 w-4 mr-1" /> {apps.length === 0 ? "Create Application" : "New Application"}
            </Button>
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

          <div className="bg-card border border-border">
            <div className="gov-section-header bg-muted px-6 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">Application History</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{filteredApps.length} of {apps.length} application{apps.length !== 1 ? "s" : ""}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")} title="Sort by date">
                <ArrowUpDown className="h-3 w-3 mr-1" /> Date
              </Button>
            </div>

            {filteredApps.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-semibold">{apps.length === 0 ? "No applications yet" : "No matching applications"}</p>
                <p className="text-muted-foreground text-sm mt-1">{apps.length === 0 ? 'Click "Create Application" to get started.' : "Try adjusting your filters."}</p>
              </div>
            ) : (
              <Table className="gov-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
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
                      <TableCell className="text-sm">{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell><GovStatusBadge status={app.stage} /></TableCell>
                      <TableCell><GovStatusBadge status={app.status} stage={app.stage} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(app.workflowStep === "prelim_review" || app.workflowStep === "prelim_submitted" || app.workflowStep === "prelim_revision") && (app.status === "pending_review" || app.status === "reverted") && (
                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase border-primary text-primary"
                              onClick={() => navigate(`/prelim-application?edit=${app.id}`)}>Update Prelim</Button>
                          )}
                          {(app.workflowStep === "detailed_form" || app.workflowStep === "detailed_form_open") && (
                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase border-primary text-primary"
                              onClick={() => navigate(`/detailed-application?appId=${app.id}`)}>Fill Detailed Appl.</Button>
                          )}
                          {app.workflowStep === "detailed_revision" && (
                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase border-primary text-primary"
                              onClick={() => navigate(`/detailed-application?appId=${app.id}`)}>Resubmit</Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => navigate(`/application-view/${app.id}`)} title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this application?")) {
                                await deleteApp(app.id);
                                toast({ title: "Application Deleted" });
                              }
                            }} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default ApplicantDashboard;
