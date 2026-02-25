import { MessageSquare } from "lucide-react";
import type { AuditEntry } from "@/lib/applicationStore";

interface StageCommentsProps {
  auditTrail: AuditEntry[];
  stage: string;
}

const GovSectionHeader = ({ title }: { title: string }) => (
  <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
    <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">{title}</h2>
  </div>
);

/** Groups audit trail comments by Prelim / Detailed stages, visible to all roles */
const StageComments = ({ auditTrail, stage }: StageCommentsProps) => {
  if (!auditTrail || auditTrail.length === 0) return null;

  const prelimActions = [
    "revert_prelim", "reject_prelim", "approve_prelim",
    "submitted", "reverted", "approved", "rejected",
  ];
  const detailedActions = [
    "revert_detailed", "recommend_rejection", "recommend_pursual",
    "reject_final", "recommend_icvd",
    "recommended_for_approval", "recommended_for_rejection",
  ];
  const icvdActions = [
    "icvd_maker_forward", "icvd_checker_assign_convenor",
    "icvd_schedule_meeting", "icvd_committee_refer",
    "submit_icvd_note", "revert_icvd", "approve_icvd",
    "record_committee_decision",
  ];
  const ccicActions = [
    "ccic_maker_upload", "ccic_checker_assign_convenor",
    "ccic_schedule_meeting", "ccic_committee_refer",
    "submit_ccic_note", "revert_ccic", "approve_ccic",
    "approve_sanction", "reject_sanction",
  ];

  const classifyEntry = (entry: AuditEntry): "prelim" | "detailed" | "icvd" | "ccic" => {
    const action = entry.actionType;
    if (prelimActions.includes(action)) return "prelim";
    if (detailedActions.includes(action)) return "detailed";
    if (icvdActions.includes(action)) return "icvd";
    if (ccicActions.includes(action)) return "ccic";
    if (action.includes("prelim")) return "prelim";
    if (action.includes("icvd")) return "icvd";
    if (action.includes("ccic")) return "ccic";
    return "detailed";
  };

  const withComments = auditTrail.filter((e) => e.remark?.trim());
  if (withComments.length === 0) return null;

  const prelimComments = withComments.filter((e) => classifyEntry(e) === "prelim");
  const detailedComments = withComments.filter((e) => classifyEntry(e) === "detailed");
  const icvdComments = withComments.filter((e) => classifyEntry(e) === "icvd");
  const ccicComments = withComments.filter((e) => classifyEntry(e) === "ccic");

  const renderCommentList = (comments: AuditEntry[], stageLabel: string) => {
    if (comments.length === 0) return null;
    return (
      <div className="bg-card border border-border">
        <GovSectionHeader title={`${stageLabel} — Comments`} />
        <div className="p-4 space-y-3">
          {comments.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-border last:border-0 pb-3 last:pb-0">
              <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs uppercase tracking-wide text-muted-foreground">
                    {entry.actorRole.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{entry.remark}</p>
                <span className="text-xs text-muted-foreground mt-1 inline-block">
                  Action: {entry.actionType.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderCommentList(prelimComments, "Preliminary")}
      {renderCommentList(detailedComments, "Detailed")}
      {renderCommentList(icvdComments, "IC-VD")}
      {renderCommentList(ccicComments, "CCIC-CGM")}
    </div>
  );
};

export default StageComments;
