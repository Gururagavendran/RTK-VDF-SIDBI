import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import GovStatusBadge from "@/components/GovStatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useGetMeetingsQuery } from "@/store/api";
import type { MeetingType } from "@/lib/meetingStore";
import { getSession } from "@/lib/authStore";
import { ArrowLeft, Calendar, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const titleMap: Record<string, string> = {
  icvd: "IC-VD Review",
  ccic: "CCIC-CG Review",
};

const CommitteeMeetingsList = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const session = getSession();
  const { toast } = useToast();
  const { data: meetings = [] } = useGetMeetingsQuery({ type: type as MeetingType });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [concerns, setConcerns] = useState<Record<string, boolean>>({});

  const title = titleMap[type ?? ""] ?? "Meetings";
  const hasConcern = Object.values(concerns).some(v => v === true);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleAll = () => {
    if (selected.size === meetings.length) setSelected(new Set());
    else setSelected(new Set(meetings.map(m => m.id)));
  };

  const handleForward = () => {
    if (!hasConcern) { toast({ title: "No concerns flagged", variant: "destructive" }); return; }
    toast({ title: "Forwarded to CCIC-CGM" });
    setSelected(new Set());
  };

  return (
    <AppLayout title={`SIDBI — ${title}`} subtitle="Committee Meetings">
      <div className="flex-1">
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/sidbi/dashboard")}><ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard</Button>
              <h1 className="text-xl font-bold text-foreground uppercase tracking-wider">{title} — Meetings</h1>
            </div>
            {type === "icvd" && (
              <Button size="sm" className="text-xs font-bold uppercase" disabled={!hasConcern} onClick={handleForward}>
                <Send className="h-3 w-3 mr-1" /> Forward to CCIC-CGM
              </Button>
            )}
          </div>
          <div className="bg-card border border-border">
            <div className="gov-section-header bg-muted px-6 py-3 border-b border-border flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">Meetings Scheduled</h2>
              <span className="text-xs text-muted-foreground ml-2">({meetings.length})</span>
            </div>
            {meetings.length === 0 ? (
              <div className="p-8 text-center"><p className="text-sm text-muted-foreground">No {title} meetings scheduled yet.</p></div>
            ) : (
              <Table className="gov-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={selected.size === meetings.length && meetings.length > 0} onCheckedChange={toggleAll} /></TableHead>
                    <TableHead>MEETING ID</TableHead><TableHead>MEETING NAME</TableHead><TableHead>SCHEDULED</TableHead>
                    <TableHead>COMPLETED</TableHead><TableHead>CONSENT PROVIDED</TableHead><TableHead>CONCERN</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell><Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggleSelect(m.id)} /></TableCell>
                      <TableCell className="font-mono text-xs">{m.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-medium">{m.subject}</TableCell>
                      <TableCell>{new Date(m.dateTime).toLocaleString()}</TableCell>
                      <TableCell><GovStatusBadge status={m.status === "completed" ? "approved" : "pending_review"} /></TableCell>
                      <TableCell><GovStatusBadge status={m.outcome ? "approved" : "pending_review"} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={concerns[m.id] ?? false} onCheckedChange={(v) => setConcerns(prev => ({ ...prev, [m.id]: v }))} />
                          <span className="text-xs font-medium text-muted-foreground">{concerns[m.id] ? "Yes" : "No"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="text-xs font-bold uppercase" onClick={() => navigate(`/sidbi/committee-review/${m.type}/${m.id}`)}>View</Button>
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

export default CommitteeMeetingsList;
