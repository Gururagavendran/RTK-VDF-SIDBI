import type { AppStatus } from "@/lib/applicationStore";

const statusConfig: Record<string, { label: string; className: string }> = {
  // Stages
  prelim: { label: "PRELIMINARY APPLICATION", className: "bg-info/10 text-info border-info" },
  detailed: { label: "DETAILED APPLICATION", className: "bg-secondary/10 text-secondary border-secondary" },
  icvd: { label: "IC-VD", className: "bg-primary/10 text-primary border-primary" },
  ccic: { label: "CCIC-CGM", className: "bg-accent/10 text-accent border-accent" },
  final: { label: "FINAL", className: "bg-warning/10 text-warning border-warning" },
  post_sanction: { label: "POST SANCTION", className: "bg-success/10 text-success border-success" },
  // Statuses
  submitted: { label: "SUBMITTED", className: "bg-warning/10 text-warning border-warning" },
  pending_review: { label: "SUBMITTED", className: "bg-warning/10 text-warning border-warning" },
  reverted: { label: "REVERTED", className: "bg-accent/10 text-accent border-accent" },
  approved: { label: "APPROVED", className: "bg-success/10 text-success border-success" },
  rejected: { label: "REJECTED", className: "bg-destructive/10 text-destructive border-destructive" },
  recommended_for_approval: { label: "RECOMMENDED FOR APPROVAL", className: "bg-success/10 text-success border-success" },
  recommended_for_rejection: { label: "RECOMMENDED FOR REJECTION", className: "bg-destructive/10 text-destructive border-destructive" },
  recommend_pursual: { label: "APPROVED BY MAKER", className: "bg-success/10 text-success border-success" },
  recommend_rejection: { label: "REJECTED BY MAKER", className: "bg-destructive/10 text-destructive border-destructive" },
  sanctioned: { label: "SANCTIONED", className: "bg-success/10 text-success border-success" },
  draft: { label: "DRAFT", className: "bg-draft/10 text-draft border-draft" },
  under_review: { label: "UNDER REVIEW", className: "bg-info/10 text-info border-info" },
  // Workflow steps
  prelim_submitted: { label: "PRELIM APPL. SUBMITTED", className: "bg-warning/10 text-warning border-warning" },
  prelim_revision: { label: "PRELIM APPL. REVERTED TO APPLICANT", className: "bg-accent/10 text-accent border-accent" },
  prelim_rejected: { label: "PRELIM APPL. REJECTED", className: "bg-destructive/10 text-destructive border-destructive" },
  detailed_form_open: { label: "PRELIM APPL. APPROVED", className: "bg-success/10 text-success border-success" },
  detailed_form: { label: "PRELIM APPL. APPROVED", className: "bg-success/10 text-success border-success" },
  detailed_revision: { label: "DETAILED APPL. REVERTED TO APPLICANT", className: "bg-accent/10 text-accent border-accent" },
  detailed_maker_review: { label: "DETAILED APPL. UNDER MAKER REVIEW", className: "bg-info/10 text-info border-info" },
  detailed_checker_review: { label: "DETAILED APPL. UNDER CHECKER REVIEW", className: "bg-info/10 text-info border-info" },
  detailed_rejected: { label: "DETAILED APPL. REJECTED", className: "bg-destructive/10 text-destructive border-destructive" },
  icvd_maker_review: { label: "IC-VD NOTE UNDER MAKER REVIEW", className: "bg-info/10 text-info border-info" },
  icvd_checker_review: { label: "IC-VD NOTE UNDER CHECKER REVIEW", className: "bg-info/10 text-info border-info" },
  icvd_convenor_scheduling: { label: "IC-VD MEETING BEING SCHEDULED", className: "bg-primary/10 text-primary border-primary" },
  icvd_committee_review: { label: "IC-VD UNDER COMMITTEE REVIEW", className: "bg-primary/10 text-primary border-primary" },
  icvd_note_preparation: { label: "IC-VD NOTE PREPARATION", className: "bg-info/10 text-info border-info" },
  icvd_referred: { label: "IC-VD REFERRED TO CCIC", className: "bg-accent/10 text-accent border-accent" },
  ccic_maker_refine: { label: "CCIC NOTE UNDER MAKER REVIEW", className: "bg-accent/10 text-accent border-accent" },
  ccic_checker_review: { label: "CCIC NOTE UNDER CHECKER REVIEW", className: "bg-accent/10 text-accent border-accent" },
  ccic_convenor_scheduling: { label: "CCIC MEETING BEING SCHEDULED", className: "bg-accent/10 text-accent border-accent" },
  ccic_committee_review: { label: "CCIC UNDER COMMITTEE REVIEW", className: "bg-accent/10 text-accent border-accent" },
  ccic_note_preparation: { label: "CCIC NOTE PREPARATION", className: "bg-accent/10 text-accent border-accent" },
  ccic_referred: { label: "CCIC REFERRED TO FINAL", className: "bg-warning/10 text-warning border-warning" },
  final_approval: { label: "PENDING FINAL APPROVAL", className: "bg-warning/10 text-warning border-warning" },
  final_rejected: { label: "FINAL REJECTED", className: "bg-destructive/10 text-destructive border-destructive" },
  completed: { label: "COMPLETED", className: "bg-success/10 text-success border-success" },
};

interface GovStatusBadgeProps {
  status: AppStatus | string;
  stage?: string;
  className?: string;
}

const stageSubmittedLabels: Record<string, string> = {
  prelim: "PRELIM APPL. SUBMITTED",
  detailed: "DETAILED APPL. SUBMITTED",
  icvd: "IC-VD SUBMITTED",
  ccic: "CCIC-CGM SUBMITTED",
  final: "FINAL SUBMITTED",
};

const stageRevertedLabels: Record<string, string> = {
  prelim: "PRELIM APPL. REVERTED",
  detailed: "DETAILED APPL. REVERTED",
  icvd: "IC-VD REVERTED",
  ccic: "CCIC-CGM REVERTED",
};

const stageApprovedLabels: Record<string, string> = {
  detailed: "PRELIM APPL. APPROVED",
  icvd: "DETAILED APPL. APPROVED",
  ccic: "IC-VD APPROVED",
  final: "CCIC-CGM APPROVED",
  post_sanction: "FINAL APPROVED",
};

const GovStatusBadge = ({ status, stage, className = "" }: GovStatusBadgeProps) => {
  let config = statusConfig[status] || { label: status.toUpperCase().replace(/_/g, " "), className: "bg-muted text-muted-foreground border-border" };

  // Override submitted/pending_review label based on stage
  if ((status === "submitted" || status === "pending_review") && stage) {
    const stageLabel = stageSubmittedLabels[stage] || config.label;
    config = { ...config, label: stageLabel };
  }

  // Override reverted label based on stage
  if (status === "reverted" && stage) {
    const stageLabel = stageRevertedLabels[stage] || config.label;
    config = { ...config, label: stageLabel };
  }

  // Override approved label based on stage
  if (status === "approved" && stage) {
    const stageLabel = stageApprovedLabels[stage] || config.label;
    config = { ...config, label: stageLabel };
  }

  return (
    <span className={`gov-badge ${config.className} ${className}`}>
      {config.label}
    </span>
  );
};

export default GovStatusBadge;
