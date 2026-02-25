import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Application,
  AppStatus,
  WorkflowAction,
  FieldComment,
} from "@/lib/applicationStore";
import { isValidTransition, workflowTransitions } from "@/lib/applicationStore";
import { mockApplications } from "@/store/mockData";

// Duplicated from applicationStore to keep slice self-contained
const actionTransitions: Record<string, string> = {
  revert_prelim: "prelim_revision",
  reject_prelim: "prelim_rejected",
  approve_prelim: "detailed_form_open",
  revert_detailed: "detailed_revision",
  recommend_rejection: "detailed_checker_review",
  recommend_pursual: "detailed_checker_review",
  reject_final: "detailed_rejected",
  recommend_icvd: "icvd_maker_review",
  recommend_ccic: "ccic_maker_refine",
  icvd_maker_forward: "icvd_checker_review",
  icvd_checker_assign_convenor: "icvd_convenor_scheduling",
  icvd_schedule_meeting: "icvd_committee_review",
  icvd_committee_refer: "ccic_maker_refine",
  submit_icvd_note: "icvd_checker_review",
  revert_icvd: "icvd_maker_review",
  approve_icvd: "icvd_convenor_scheduling",
  record_committee_decision: "ccic_maker_refine",
  ccic_maker_upload: "ccic_checker_review",
  ccic_checker_assign_convenor: "ccic_convenor_scheduling",
  ccic_schedule_meeting: "ccic_committee_review",
  ccic_committee_refer: "final_approval",
  submit_ccic_note: "ccic_checker_review",
  revert_ccic: "ccic_maker_refine",
  approve_ccic: "final_approval",
  approve_sanction: "sanctioned",
  reject_sanction: "final_rejected",
};

interface ApplicationsState {
  items: Application[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  items: [],
  isLoading: false,
  error: null,
};

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    seedMockApplications(state) {
      if (state.items.length === 0) {
        state.items = mockApplications;
      }
    },
    loadApplications(state, action: PayloadAction<Application[]>) {
      state.items = action.payload;
      state.isLoading = false;
    },
    createPrelimApplication(
      state,
      action: PayloadAction<{ email: string; prelimData: any }>
    ) {
      const app: Application = {
        id: crypto.randomUUID(),
        applicantEmail: action.payload.email,
        status: "submitted",
        stage: "prelim",
        workflowStep: "prelim_submitted",
        prelimData: action.payload.prelimData,
        detailedData: null,
        comments: {},
        auditTrail: [
          {
            actorRole: "applicant",
            actorId: action.payload.email,
            actionType: "submit",
            remark: "Preliminary application submitted",
            timestamp: new Date().toISOString(),
          },
        ],
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.items.push(app);
    },
    submitDetailedApplication(
      state,
      action: PayloadAction<{ appId: string; detailedData: any }>
    ) {
      const app = state.items.find((a) => a.id === action.payload.appId);
      if (app) {
        app.stage = "detailed";
        app.status = "submitted";
        app.workflowStep = "detailed_maker_review";
        app.detailedData = action.payload.detailedData;
        app.comments = {};
        app.updatedAt = new Date().toISOString();
      }
    },
    applyWorkflowAction(
      state,
      action: PayloadAction<{
        id: string;
        workflowAction: WorkflowAction;
        actor: { role: string; id: string };
        comment?: string;
        assignedChecker?: string;
        assignedConvenor?: string;
        assignedApprover?: string;
        recommendedOutcome?: "rejection" | "pursual";
        meetingId?: string;
      }>
    ) {
      const { id, workflowAction, actor, comment, ...opts } = action.payload;
      const app = state.items.find((a) => a.id === id);
      if (!app) return;

      if (!isValidTransition(app.workflowStep, workflowAction)) return;

      const nextStep = actionTransitions[workflowAction];
      if (!nextStep) return;

      app.workflowStep = nextStep as any;
      app.updatedAt = new Date().toISOString();

      if (opts.assignedChecker) app.assignedChecker = opts.assignedChecker;
      if (opts.assignedConvenor) app.assignedConvenor = opts.assignedConvenor;
      if (opts.assignedApprover) app.assignedApprover = opts.assignedApprover;
      if (opts.recommendedOutcome) app.recommendedOutcome = opts.recommendedOutcome;
      if (opts.meetingId) {
        if (workflowAction.startsWith("icvd_")) app.icvdMeetingId = opts.meetingId;
        if (workflowAction.startsWith("ccic_")) app.ccicMeetingId = opts.meetingId;
      }

      // Derive status
      if (["reject_prelim", "reject_final", "reject_sanction"].includes(workflowAction)) {
        app.status = "rejected";
      } else if (workflowAction === "approve_sanction") {
        app.status = "sanctioned";
        app.stage = "post_sanction";
      } else if (workflowAction === "approve_prelim") {
        app.status = "approved";
        app.stage = "detailed";
      } else if (workflowAction === "recommend_pursual") {
        app.status = "recommend_pursual";
      } else if (workflowAction === "recommend_rejection") {
        app.status = "recommend_rejection";
      } else if (workflowAction === "revert_prelim" || workflowAction === "revert_detailed") {
        app.status = "reverted";
      } else if (workflowAction === "recommend_icvd") {
        app.status = "submitted";
        app.stage = "icvd";
      } else if (workflowAction === "recommend_ccic") {
        app.status = "submitted";
        app.stage = "ccic";
      }

      if (!app.auditTrail) app.auditTrail = [];
      app.auditTrail.push({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: workflowAction,
        remark: comment ?? "",
        timestamp: new Date().toISOString(),
      });

      if (comment) {
        app.comments = {
          ...app.comments,
          _global: {
            needsChange: workflowAction.startsWith("revert"),
            comment,
          },
        };
      }
    },
    updatePrelimData(
      state,
      action: PayloadAction<{ id: string; prelimData: any }>
    ) {
      const app = state.items.find((a) => a.id === action.payload.id);
      if (app) {
        app.prelimData = action.payload.prelimData;
        app.status = "submitted";
        app.workflowStep = "prelim_submitted";
        app.comments = {};
        app.updatedAt = new Date().toISOString();
      }
    },
    deleteApplication(state, action: PayloadAction<string>) {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
  },
});

export const {
  seedMockApplications,
  loadApplications,
  createPrelimApplication,
  submitDetailedApplication,
  applyWorkflowAction,
  updatePrelimData,
  deleteApplication,
} = applicationsSlice.actions;
export default applicationsSlice.reducer;
