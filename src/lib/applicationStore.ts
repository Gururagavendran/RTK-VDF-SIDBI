// ─────────────────────────────────────────────────────────────────────────────
// applicationStore.ts  –  Single source of truth for workflow state machine
// ─────────────────────────────────────────────────────────────────────────────

export type AppStatus =
  | "submitted"
  | "pending_review"
  | "reverted"
  | "approved"
  | "rejected"
  | "recommended_for_approval"    // legacy alias → recommend_pursual
  | "recommended_for_rejection"   // legacy alias → recommend_rejection
  | "recommend_pursual"
  | "recommend_rejection"
  | "sanctioned";

export type AppStage = "prelim" | "detailed" | "icvd" | "ccic" | "final" | "post_sanction";

// ── Workflow steps ────────────────────────────────────────────────────────────
export type WorkflowStep =
  // Prelim
  | "prelim_review"       // ← legacy alias kept for backfill
  | "prelim_submitted"
  | "prelim_revision"
  | "prelim_rejected"
  // Detailed
  | "detailed_form"       // ← legacy alias kept for backfill
  | "detailed_form_open"
  | "detailed_revision"
  | "detailed_maker_review"
  | "detailed_checker_review"
  | "detailed_rejected"
  // IC-VD
  | "icvd_maker_review"
  | "icvd_checker_review"
  | "icvd_convenor_scheduling"
  | "icvd_committee_review"
  | "icvd_referred"
  // Legacy ICVD aliases
  | "icvd_note_preparation"
  // CCIC-CGM
  | "ccic_maker_refine"
  | "ccic_checker_review"
  | "ccic_convenor_scheduling"
  | "ccic_committee_review"
  | "ccic_referred"
  // Legacy CCIC aliases
  | "ccic_note_preparation"
  // Final
  | "final_approval"
  | "final_rejected"
  // Terminal
  | "sanctioned"
  | "completed";

// ── Action types ──────────────────────────────────────────────────────────────
export type WorkflowAction =
  | "revert_prelim"
  | "reject_prelim"
  | "approve_prelim"
  | "revert_detailed"
  | "recommend_rejection"
  | "recommend_pursual"
  | "reject_final"
  | "recommend_icvd"
  // ICVD flow
  | "recommend_ccic"
  | "icvd_maker_forward"
  | "icvd_checker_assign_convenor"
  | "icvd_schedule_meeting"
  | "icvd_committee_refer"
  // Legacy ICVD
  | "submit_icvd_note"
  | "revert_icvd"
  | "approve_icvd"
  | "record_committee_decision"
  // CCIC-CGM flow
  | "ccic_maker_upload"
  | "ccic_checker_assign_convenor"
  | "ccic_schedule_meeting"
  | "ccic_committee_refer"
  // Legacy CCIC
  | "submit_ccic_note"
  | "revert_ccic"
  | "approve_ccic"
  // Final
  | "approve_sanction"
  | "reject_sanction";

// ── Transition map (workflowStep → allowed actions) ──────────────────────────
export const workflowTransitions: Record<WorkflowStep, WorkflowAction[]> = {
  prelim_review:            ["revert_prelim", "reject_prelim", "approve_prelim"],
  prelim_submitted:         ["revert_prelim", "reject_prelim", "approve_prelim"],
  prelim_revision:          [],
  prelim_rejected:          [],
  detailed_form:            [],
  detailed_form_open:       [],
  detailed_revision:        [],
  detailed_maker_review:    ["revert_detailed", "recommend_rejection", "recommend_pursual"],
  detailed_checker_review:  ["reject_final", "recommend_icvd", "recommend_ccic"],
  detailed_rejected:        [],
  // ICVD flow
  icvd_maker_review:        ["icvd_maker_forward"],
  icvd_checker_review:      ["icvd_checker_assign_convenor"],
  icvd_convenor_scheduling: ["icvd_schedule_meeting"],
  icvd_committee_review:    ["icvd_committee_refer"],
  icvd_referred:            [],
  // Legacy ICVD
  icvd_note_preparation:    ["submit_icvd_note", "icvd_maker_forward"],
  // CCIC-CGM flow
  ccic_maker_refine:        ["ccic_maker_upload"],
  ccic_checker_review:      ["ccic_checker_assign_convenor"],
  ccic_convenor_scheduling: ["ccic_schedule_meeting"],
  ccic_committee_review:    ["ccic_committee_refer"],
  ccic_referred:            [],
  // Legacy CCIC
  ccic_note_preparation:    ["submit_ccic_note", "ccic_maker_upload"],
  // Final
  final_approval:           ["approve_sanction", "reject_sanction"],
  final_rejected:           [],
  sanctioned:               [],
  completed:                [],
};

// ── Step → next step map ──────────────────────────────────────────────────────
const actionTransitions: Partial<Record<WorkflowAction, WorkflowStep>> = {
  revert_prelim:              "prelim_revision",
  reject_prelim:              "prelim_rejected",
  approve_prelim:             "detailed_form_open",
  revert_detailed:            "detailed_revision",
  recommend_rejection:        "detailed_checker_review",
  recommend_pursual:          "detailed_checker_review",
  reject_final:               "detailed_rejected",
  recommend_icvd:             "icvd_maker_review",
  recommend_ccic:             "ccic_maker_refine",
  // ICVD
  icvd_maker_forward:         "icvd_checker_review",
  icvd_checker_assign_convenor: "icvd_convenor_scheduling",
  icvd_schedule_meeting:      "icvd_committee_review",
  icvd_committee_refer:       "ccic_maker_refine",
  // Legacy ICVD
  submit_icvd_note:           "icvd_checker_review",
  revert_icvd:                "icvd_maker_review",
  approve_icvd:               "icvd_convenor_scheduling",
  record_committee_decision:  "ccic_maker_refine",
  // CCIC-CGM
  ccic_maker_upload:          "ccic_checker_review",
  ccic_checker_assign_convenor: "ccic_convenor_scheduling",
  ccic_schedule_meeting:      "ccic_committee_review",
  ccic_committee_refer:       "final_approval",
  // Legacy CCIC
  submit_ccic_note:           "ccic_checker_review",
  revert_ccic:                "ccic_maker_refine",
  approve_ccic:               "final_approval",
  // Final
  approve_sanction:           "sanctioned",
  reject_sanction:            "final_rejected",
};

// ── Validate a transition ────────────────────────────────────────────────────
export function isValidTransition(step: WorkflowStep, action: WorkflowAction): boolean {
  return (workflowTransitions[step] ?? []).includes(action);
}

// ── Data model ───────────────────────────────────────────────────────────────
export interface FieldComment {
  needsChange: boolean;
  comment: string;
}

export interface AuditEntry {
  actorRole: string;
  actorId: string;
  actionType: WorkflowAction | string;
  remark: string;
  timestamp: string;
}

export interface Application {
  id: string;
  applicantEmail: string;
  status: AppStatus;
  stage: AppStage;
  workflowStep: WorkflowStep;
  // Assignments
  assignedMaker?: string;
  assignedChecker?: string;
  assignedConvenor?: string;
  assignedApprover?: string;
  // Outcome metadata
  recommendedOutcome?: "rejection" | "pursual";
  // Data
  prelimData: any | null;
  detailedData: any | null;
  icvdNote?: any | null;
  ccicNote?: any | null;
  // Meeting references
  icvdMeetingId?: string;
  ccicMeetingId?: string;
  // Review
  comments: Record<string, FieldComment>;
  // Audit trail
  auditTrail: AuditEntry[];
  submittedAt: string;
  updatedAt: string;
}

// ── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = "venture_debt_applications";

export function getApplications(): Application[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveApplications(apps: Application[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function getApplicationsByEmail(email: string): Application[] {
  return getApplications().filter((a) => a.applicantEmail === email);
}

export function getApplicationById(id: string): Application | null {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  // ── Backfill legacy records ───────────────────────────────────────────────
  if (!apps[idx].workflowStep) {
    const app = apps[idx];
    if (app.stage === "detailed" && app.detailedData) {
      if (app.status === "recommended_for_approval" || app.status === "recommended_for_rejection") {
        apps[idx].workflowStep = "detailed_checker_review";
      } else if (app.status === "approved" || app.status === "rejected") {
        apps[idx].workflowStep = "completed";
      } else {
        apps[idx].workflowStep = "detailed_maker_review";
      }
    } else if (app.stage === "detailed" && !app.detailedData) {
      apps[idx].workflowStep = "detailed_form_open";
    } else if (app.status === "approved") {
      apps[idx].workflowStep = "detailed_form_open";
    } else if (app.status === "rejected") {
      apps[idx].workflowStep = "completed";
    } else {
      apps[idx].workflowStep = "prelim_submitted";
    }
    saveApplications(apps);
  }

  if (!apps[idx].auditTrail) {
    apps[idx].auditTrail = [];
    saveApplications(apps);
  }

  return apps[idx];
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export function createPrelimApplication(email: string, prelimData: any): Application {
  const apps = getApplications();
  const app: Application = {
    id: crypto.randomUUID(),
    applicantEmail: email,
    status: "submitted",
    stage: "prelim",
    workflowStep: "prelim_submitted",
    prelimData,
    detailedData: null,
    comments: {},
    auditTrail: [],
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  apps.push(app);
  saveApplications(apps);
  return app;
}

export function submitDetailedApplication(appId: string, detailedData: any): void {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx !== -1) {
    apps[idx].stage = "detailed";
    apps[idx].status = "submitted";
    apps[idx].workflowStep = "detailed_maker_review";
    apps[idx].detailedData = detailedData;
    apps[idx].comments = {};
    apps[idx].updatedAt = new Date().toISOString();
    saveApplications(apps);
  }
}

/**
 * Core transition function — validates against the state machine,
 * advances workflowStep, appends audit entry.
 */
export function applyWorkflowAction(
  id: string,
  action: WorkflowAction,
  actor: { role: string; id: string },
  options?: {
    comment?: string;
    assignedChecker?: string;
    assignedConvenor?: string;
    assignedApprover?: string;
    recommendedOutcome?: "rejection" | "pursual";
    meetingId?: string;
  }
): { success: boolean; error?: string } {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, error: "Application not found." };

  const app = apps[idx];
  const currentStep = app.workflowStep;

  if (!isValidTransition(currentStep, action)) {
    const msg = `Invalid workflow transition: cannot perform "${action}" from step "${currentStep}".`;
    console.error("[applicationStore]", msg);
    return { success: false, error: msg };
  }

  const nextStep = actionTransitions[action];
  if (!nextStep) return { success: false, error: "Unknown action." };

  // Apply step
  apps[idx].workflowStep = nextStep;
  apps[idx].updatedAt = new Date().toISOString();

  // Assignments
  if (options?.assignedChecker)  apps[idx].assignedChecker  = options.assignedChecker;
  if (options?.assignedConvenor) apps[idx].assignedConvenor = options.assignedConvenor;
  if (options?.assignedApprover) apps[idx].assignedApprover = options.assignedApprover;
  if (options?.recommendedOutcome) apps[idx].recommendedOutcome = options.recommendedOutcome;
  if (options?.meetingId) {
    if (action.startsWith("icvd_")) apps[idx].icvdMeetingId = options.meetingId;
    if (action.startsWith("ccic_")) apps[idx].ccicMeetingId = options.meetingId;
  }

  // Derive status & stage from action
  if (action === "reject_prelim" || action === "reject_final" || action === "reject_sanction") {
    apps[idx].status = "rejected";
  } else if (action === "approve_sanction") {
    apps[idx].status = "sanctioned";
    apps[idx].stage = "post_sanction";
  } else if (action === "approve_prelim") {
    apps[idx].status = "approved";
    apps[idx].stage = "detailed";
  } else if (action === "recommend_pursual") {
    apps[idx].status = "recommend_pursual";
  } else if (action === "recommend_rejection") {
    apps[idx].status = "recommend_rejection";
  } else if (action === "revert_prelim" || action === "revert_detailed") {
    apps[idx].status = "reverted";
  } else if (action === "recommend_icvd") {
    apps[idx].status = "submitted";
    apps[idx].stage = "icvd";
  } else if (action === "recommend_ccic") {
    apps[idx].status = "submitted";
    apps[idx].stage = "ccic";
  } else if (action === "icvd_maker_forward" || action === "submit_icvd_note") {
    apps[idx].status = "submitted";
    apps[idx].stage = "icvd";
  } else if (action === "icvd_checker_assign_convenor" || action === "approve_icvd") {
    apps[idx].status = "submitted";
    apps[idx].stage = "icvd";
  } else if (action === "icvd_schedule_meeting") {
    apps[idx].status = "under_review" as any;
    apps[idx].stage = "icvd";
  } else if (action === "icvd_committee_refer" || action === "record_committee_decision") {
    apps[idx].status = "submitted";
    apps[idx].stage = "ccic";
  } else if (action === "ccic_maker_upload" || action === "submit_ccic_note") {
    apps[idx].status = "submitted";
    apps[idx].stage = "ccic";
  } else if (action === "ccic_checker_assign_convenor" || action === "approve_ccic") {
    apps[idx].status = "submitted";
    apps[idx].stage = "ccic";
  } else if (action === "ccic_schedule_meeting") {
    apps[idx].status = "under_review" as any;
    apps[idx].stage = "ccic";
  } else if (action === "ccic_committee_refer") {
    apps[idx].status = "submitted";
    apps[idx].stage = "final";
  }

  // Append to audit trail
  if (!apps[idx].auditTrail) apps[idx].auditTrail = [];
  apps[idx].auditTrail.push({
    actorRole: actor.role,
    actorId: actor.id,
    actionType: action,
    remark: options?.comment ?? "",
    timestamp: new Date().toISOString(),
  });

  // Store global comment
  if (options?.comment) {
    apps[idx].comments = {
      ...apps[idx].comments,
      _global: { needsChange: action.startsWith("revert"), comment: options.comment },
    };
  }

  saveApplications(apps);
  console.log("[applicationStore] applyWorkflowAction:", { id, action, nextStep });
  return { success: true };
}

/**
 * Legacy shim — maps old status-based calls to the new action-based engine.
 */
export function updateApplicationStatus(
  id: string,
  status: AppStatus,
  comments?: Record<string, FieldComment>
): void {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return;

  const current = apps[idx];
  apps[idx].status = status;
  if (comments) apps[idx].comments = comments;
  apps[idx].updatedAt = new Date().toISOString();

  if (status === "approved") {
    apps[idx].workflowStep =
      (current.workflowStep === "prelim_review" || current.workflowStep === "prelim_submitted")
        ? "detailed_form_open"
        : "sanctioned";
    if (current.workflowStep === "prelim_review" || current.workflowStep === "prelim_submitted") {
      apps[idx].stage = "detailed";
    }
  } else if (status === "rejected") {
    apps[idx].workflowStep = "completed";
  } else if (status === "recommended_for_approval" || status === "recommend_pursual") {
    apps[idx].workflowStep = "detailed_checker_review";
  } else if (status === "recommended_for_rejection" || status === "recommend_rejection") {
    apps[idx].workflowStep = "detailed_checker_review";
  } else if (status === "reverted") {
    if (current.workflowStep === "prelim_review" || current.workflowStep === "prelim_submitted") {
      apps[idx].workflowStep = "prelim_revision";
    } else if (current.workflowStep === "detailed_maker_review") {
      apps[idx].workflowStep = "detailed_revision";
    }
  }

  if (!apps[idx].auditTrail) apps[idx].auditTrail = [];
  apps[idx].auditTrail.push({
    actorRole: "sidbi",
    actorId: "system",
    actionType: status,
    remark: comments?._global?.comment ?? "",
    timestamp: new Date().toISOString(),
  });

  saveApplications(apps);
}

export function updatePrelimData(id: string, prelimData: any): void {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx !== -1) {
    apps[idx].prelimData = prelimData;
    apps[idx].status = "submitted";
    apps[idx].workflowStep = "prelim_submitted";
    apps[idx].comments = {};
    apps[idx].updatedAt = new Date().toISOString();
    saveApplications(apps);
  }
}

export function revertEmptyDetailedApplications(): void {
  const apps = getApplications();
  let changed = false;
  apps.forEach((app) => {
    if (app.stage === "detailed" && app.status === "submitted" && !app.detailedData) {
      app.stage = "prelim";
      app.status = "approved";
      app.workflowStep = "detailed_form_open";
      changed = true;
    }
  });
  if (changed) saveApplications(apps);
}

export function deleteApplication(id: string): void {
  const apps = getApplications().filter((a) => a.id !== id);
  saveApplications(apps);
}
