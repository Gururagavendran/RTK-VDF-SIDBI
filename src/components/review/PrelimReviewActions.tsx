import { Button } from "@/components/ui/button";
import type { AppStatus } from "@/lib/applicationStore";

interface PrelimReviewActionsProps {
  sidbiRole: string;
  onAction: (newStatus: AppStatus, toastTitle: string) => void;
}

/**
 * Rendered ONLY when workflowStep === "prelim_review".
 * Both Maker and Checker: Revert | Reject | Approve
 */
const PrelimReviewActions = ({ sidbiRole, onAction }: PrelimReviewActionsProps) => {
  if (sidbiRole !== "maker" && sidbiRole !== "checker") return null;

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        className="border-warning text-warning hover:bg-warning/10 rounded-none font-bold uppercase tracking-wider text-xs"
        onClick={() => onAction("reverted", "Reverted to Applicant — Prelim data preserved for update")}
      >
        Revert
      </Button>
      <Button
        variant="destructive"
        className="rounded-none font-bold uppercase tracking-wider text-xs"
        onClick={() => onAction("rejected", "Rejected")}
      >
        Reject
      </Button>
      <Button
        className="rounded-none font-bold uppercase tracking-wider text-xs bg-success hover:bg-success/90"
        onClick={() => onAction("approved", "Approved — Applicant may now fill Detailed Application")}
      >
        Approve
      </Button>
    </div>
  );
};

export default PrelimReviewActions;
