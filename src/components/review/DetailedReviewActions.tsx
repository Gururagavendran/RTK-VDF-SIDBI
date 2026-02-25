import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { AppStatus, WorkflowStep } from "@/lib/applicationStore";

const MOCK_CHECKERS = [
  { id: "checker1", name: "Rajesh Kumar" },
  { id: "checker2", name: "Priya Sharma" },
  { id: "checker3", name: "Amit Verma" },
  { id: "checker4", name: "Sunita Patel" },
];

interface DetailedReviewActionsProps {
  sidbiRole: string;
  workflowStep: WorkflowStep;
  onAction: (
    newStatus: AppStatus,
    toastTitle: string,
    meta?: { assignedChecker?: string; recommendedOutcome?: "rejection" | "pursual" }
  ) => void;
}

/**
 * Rendered ONLY when workflowStep is "detailed_maker_review" or "detailed_checker_review".
 *
 * detailed_maker_review  + maker   → Revert | Recommend for Rejection | Recommend for Pursual
 * detailed_checker_review + checker → Reject | Recommend to IC-VD
 *
 * UI driven purely by workflowStep — no stage or status checks.
 */
const DetailedReviewActions = ({ sidbiRole, workflowStep, onAction }: DetailedReviewActionsProps) => {
  const [selectedChecker, setSelectedChecker] = useState("");
  const [checkerError, setCheckerError] = useState(false);

  // ── Maker branch ─────────────────────────────────────────────────────────────
  if (workflowStep === "detailed_maker_review" && sidbiRole === "maker") {
    const requireChecker = (cb: () => void) => {
      if (!selectedChecker) {
        setCheckerError(true);
        toast({
          title: "Checker Required",
          description: "Please select a checker before making a recommendation.",
          variant: "destructive",
        });
        return;
      }
      setCheckerError(false);
      cb();
    };

    return (
      <>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Assign Checker</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Select a Checker (required for all recommendations)
            </Label>
            <Select
              value={selectedChecker}
              onValueChange={(v) => { setSelectedChecker(v); setCheckerError(false); }}
            >
              <SelectTrigger className={checkerError ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a checker…" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CHECKERS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {checkerError && (
              <p className="text-xs text-destructive mt-1">Please select a checker.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            className="border-warning text-warning hover:bg-warning/10"
            onClick={() => onAction("reverted", "Reverted to Applicant")}
          >
            Revert
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              requireChecker(() =>
                onAction("recommend_rejection", "Recommended for Rejection", {
                  assignedChecker: selectedChecker,
                  recommendedOutcome: "rejection",
                })
              )
            }
          >
            Recommend for Rejection
          </Button>
          <Button
            onClick={() =>
              requireChecker(() =>
                onAction("recommend_pursual", "Recommended for Approval", {
                  assignedChecker: selectedChecker,
                  recommendedOutcome: "pursual",
                })
              )
            }
          >
            Recommend for Approval
          </Button>
        </div>
      </>
    );
  }

  // ── Checker branch ───────────────────────────────────────────────────────────
  if (workflowStep === "detailed_checker_review" && sidbiRole === "checker") {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          variant="destructive"
          onClick={() => onAction("rejected", "Rejected")}
        >
          Reject
        </Button>
        <Button onClick={() => onAction("approved", "Recommended to IC-VD")}>
          Forward IC-VD Note to Convenor
        </Button>
      </div>
    );
  }

  return null;
};

export default DetailedReviewActions;
