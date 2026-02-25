// ─────────────────────────────────────────────────────────────────────────────
// RTK Query API with fakeBaseQuery — Mock backend for testing
// ─────────────────────────────────────────────────────────────────────────────

import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthSession, UserType, SidbiRole } from "@/lib/authStore";
import type { Registration } from "@/lib/registrationStore";
import type {
  Application,
  AppStatus,
  WorkflowAction,
  FieldComment,
  WorkflowStep,
} from "@/lib/applicationStore";
import { isValidTransition } from "@/lib/applicationStore";
import type { CommitteeMeeting, MeetingType, MeetingVote, CommitteeMember } from "@/lib/meetingStore";
import {
  mockRegistrations,
  mockApplications,
  mockMeetings,
} from "@/store/mockData";

// ── In-memory mock DB ────────────────────────────────────────────────────────
// These arrays act as our "database tables" — mutations modify them in place
// and queries read from them, simulating a real backend.

let DB_REGISTRATIONS: Registration[] = [...mockRegistrations];
let DB_APPLICATIONS: Application[] = [...mockApplications];
let DB_MEETINGS: CommitteeMeeting[] = [...mockMeetings];
let DB_SESSION: AuthSession | null = null;

// Simulate async delay
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// Demo account directory
const DEMO_ACCOUNTS: Record<string, { userType: UserType; sidbiRole?: SidbiRole }> = {
  "applicant@demo.com": { userType: "applicant" },
  "alpha@techcorp.in": { userType: "applicant" },
  "gamma@manufacturing.in": { userType: "applicant" },
  "sidbi-maker@demo.com": { userType: "sidbi", sidbiRole: "maker" },
  "sidbi-checker@demo.com": { userType: "sidbi", sidbiRole: "checker" },
  "sidbi-convenor@demo.com": { userType: "sidbi", sidbiRole: "convenor" },
  "sidbi-committee@demo.com": { userType: "sidbi", sidbiRole: "committee_member" },
  "sidbi-approving@demo.com": { userType: "sidbi", sidbiRole: "approving_authority" },
  "admin@demo.com": { userType: "admin" },
};

// ── Action transition map (duplicated from applicationStore for isolation) ──
const actionTransitions: Record<string, WorkflowStep> = {
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

function deriveStatusAndStage(app: Application, action: WorkflowAction) {
  if (["reject_prelim", "reject_final", "reject_sanction"].includes(action)) {
    app.status = "rejected";
  } else if (action === "approve_sanction") {
    app.status = "sanctioned";
    app.stage = "post_sanction";
  } else if (action === "approve_prelim") {
    app.status = "approved";
    app.stage = "detailed";
  } else if (action === "recommend_pursual") {
    app.status = "recommend_pursual";
  } else if (action === "recommend_rejection") {
    app.status = "recommend_rejection";
  } else if (action === "revert_prelim" || action === "revert_detailed") {
    app.status = "reverted";
  } else if (action === "recommend_icvd") {
    app.status = "submitted";
    app.stage = "icvd";
  } else if (action === "recommend_ccic") {
    app.status = "submitted";
    app.stage = "ccic";
  } else if (action.startsWith("icvd_")) {
    app.status = action === "icvd_schedule_meeting" ? ("under_review" as any) : "submitted";
    app.stage = "icvd";
  } else if (action.startsWith("ccic_")) {
    if (action === "ccic_committee_refer") {
      app.status = "submitted";
      app.stage = "final";
    } else {
      app.status = action === "ccic_schedule_meeting" ? ("under_review" as any) : "submitted";
      app.stage = "ccic";
    }
  }
}

// ── RTK Query API Definition ─────────────────────────────────────────────────
export const api = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Auth", "Applications", "Registrations", "Meetings"],

  endpoints: (builder) => ({
    // ═══════════════════════════════════════════════════════════════════════
    // AUTH
    // ═══════════════════════════════════════════════════════════════════════
    login: builder.mutation<AuthSession, { email: string; password: string }>({
      queryFn: async ({ email, password }) => {
        await delay();
        const account = DEMO_ACCOUNTS[email];
        if (!account) {
          return { error: { status: 401, data: "Invalid email or password" } };
        }
        const session: AuthSession = { email, userType: account.userType, sidbiRole: account.sidbiRole };
        DB_SESSION = session;
        console.log("[Mock API] login:", email);
        return { data: session };
      },
      invalidatesTags: ["Auth"],
    }),

    loginAsDemo: builder.mutation<AuthSession, { email: string; userType: UserType; sidbiRole?: SidbiRole }>({
      queryFn: async ({ email, userType, sidbiRole }) => {
        await delay(100);
        const session: AuthSession = { email, userType, sidbiRole };
        DB_SESSION = session;
        console.log("[Mock API] loginAsDemo:", email);
        return { data: session };
      },
      invalidatesTags: ["Auth"],
    }),

    logout: builder.mutation<void, void>({
      queryFn: async () => {
        DB_SESSION = null;
        return { data: undefined };
      },
      invalidatesTags: ["Auth"],
    }),

    getSession: builder.query<AuthSession | null, void>({
      queryFn: async () => {
        return { data: DB_SESSION };
      },
      providesTags: ["Auth"],
    }),

    // ═══════════════════════════════════════════════════════════════════════
    // REGISTRATIONS
    // ═══════════════════════════════════════════════════════════════════════
    getRegistrations: builder.query<Registration[], void>({
      queryFn: async () => {
        await delay();
        console.log("[Mock API] getRegistrations:", DB_REGISTRATIONS.length, "records");
        return { data: [...DB_REGISTRATIONS] };
      },
      providesTags: ["Registrations"],
    }),

    addRegistration: builder.mutation<Registration, Omit<Registration, "id" | "status" | "submittedAt">>({
      queryFn: async (data) => {
        await delay(300);
        const newReg: Registration = {
          ...data,
          id: crypto.randomUUID(),
          status: "pending",
          submittedAt: new Date().toISOString(),
        };
        DB_REGISTRATIONS.push(newReg);
        console.log("[Mock API] addRegistration:", newReg.email);
        return { data: newReg };
      },
      invalidatesTags: ["Registrations"],
    }),

    updateRegistrationStatus: builder.mutation<void, { id: string; status: "approved" | "rejected" }>({
      queryFn: async ({ id, status }) => {
        await delay();
        const reg = DB_REGISTRATIONS.find((r) => r.id === id);
        if (!reg) return { error: { status: 404, data: "Registration not found" } };
        reg.status = status;
        console.log("[Mock API] updateRegistrationStatus:", id, status);
        return { data: undefined };
      },
      invalidatesTags: ["Registrations"],
    }),

    // ═══════════════════════════════════════════════════════════════════════
    // APPLICATIONS
    // ═══════════════════════════════════════════════════════════════════════
    getApplications: builder.query<Application[], { email?: string; role?: SidbiRole } | undefined>({
      queryFn: async (args = {}) => {
        await delay();
        let result = [...DB_APPLICATIONS];
        const params = args || {};

        if (params.email) {
          result = result.filter((a) => a.applicantEmail === params.email);
        }

        if (params.role === "convenor") {
          const steps = [
            "icvd_maker_review", "icvd_checker_review", "icvd_convenor_scheduling", "icvd_committee_review", "icvd_referred",
            "ccic_maker_refine", "ccic_checker_review", "ccic_convenor_scheduling", "ccic_committee_review",
          ];
          result = result.filter((a) => steps.includes(a.workflowStep ?? ""));
        } else if (params.role === "checker") {
          const steps = [
            "detailed_checker_review", "icvd_maker_review", "icvd_checker_review",
            "icvd_convenor_scheduling", "icvd_committee_review", "icvd_referred",
          ];
          result = result.filter((a) => a.stage === "icvd" || steps.includes(a.workflowStep ?? ""));
        }

        console.log("[Mock API] getApplications:", result.length, "records");
        return { data: result };
      },
      providesTags: ["Applications"],
    }),

    getApplicationById: builder.query<Application, string>({
      queryFn: async (id) => {
        await delay(150);
        const app = DB_APPLICATIONS.find((a) => a.id === id);
        if (!app) return { error: { status: 404, data: "Application not found" } };
        // Backfill legacy records
        if (!app.workflowStep) app.workflowStep = "prelim_submitted";
        if (!app.auditTrail) app.auditTrail = [];
        return { data: { ...app } };
      },
      providesTags: (result, error, id) => [{ type: "Applications", id }],
    }),

    createPrelimApplication: builder.mutation<Application, { email: string; prelimData: any }>({
      queryFn: async ({ email, prelimData }) => {
        await delay(300);
        const app: Application = {
          id: crypto.randomUUID(),
          applicantEmail: email,
          status: "submitted",
          stage: "prelim",
          workflowStep: "prelim_submitted",
          prelimData,
          detailedData: null,
          comments: {},
          auditTrail: [{
            actorRole: "applicant",
            actorId: email,
            actionType: "submit",
            remark: "Preliminary application submitted",
            timestamp: new Date().toISOString(),
          }],
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        DB_APPLICATIONS.push(app);
        console.log("[Mock API] createPrelimApplication:", app.id);
        return { data: app };
      },
      invalidatesTags: ["Applications"],
    }),

    updatePrelimData: builder.mutation<void, { id: string; prelimData: any }>({
      queryFn: async ({ id, prelimData }) => {
        await delay(200);
        const app = DB_APPLICATIONS.find((a) => a.id === id);
        if (!app) return { error: { status: 404, data: "Application not found" } };
        app.prelimData = prelimData;
        app.status = "submitted";
        app.workflowStep = "prelim_submitted";
        app.comments = {};
        app.updatedAt = new Date().toISOString();
        console.log("[Mock API] updatePrelimData:", id);
        return { data: undefined };
      },
      invalidatesTags: ["Applications"],
    }),

    submitDetailedApplication: builder.mutation<void, { appId: string; detailedData: any }>({
      queryFn: async ({ appId, detailedData }) => {
        await delay(300);
        const app = DB_APPLICATIONS.find((a) => a.id === appId);
        if (!app) return { error: { status: 404, data: "Application not found" } };
        app.stage = "detailed";
        app.status = "submitted";
        app.workflowStep = "detailed_maker_review";
        app.detailedData = detailedData;
        app.comments = {};
        app.updatedAt = new Date().toISOString();
        console.log("[Mock API] submitDetailedApplication:", appId);
        return { data: undefined };
      },
      invalidatesTags: ["Applications"],
    }),

    applyWorkflowAction: builder.mutation<
      { success: boolean; error?: string },
      {
        id: string;
        action: WorkflowAction;
        actor: { role: string; id: string };
        comment?: string;
        assignedChecker?: string;
        assignedConvenor?: string;
        assignedApprover?: string;
        recommendedOutcome?: "rejection" | "pursual";
        meetingId?: string;
      }
    >({
      queryFn: async ({ id, action, actor, comment, ...opts }) => {
        await delay(300);
        const app = DB_APPLICATIONS.find((a) => a.id === id);
        if (!app) return { data: { success: false, error: "Application not found." } };

        if (!isValidTransition(app.workflowStep, action)) {
          return { data: { success: false, error: `Invalid transition: "${action}" from "${app.workflowStep}".` } };
        }

        const nextStep = actionTransitions[action];
        if (!nextStep) return { data: { success: false, error: "Unknown action." } };

        app.workflowStep = nextStep;
        app.updatedAt = new Date().toISOString();

        if (opts.assignedChecker) app.assignedChecker = opts.assignedChecker;
        if (opts.assignedConvenor) app.assignedConvenor = opts.assignedConvenor;
        if (opts.assignedApprover) app.assignedApprover = opts.assignedApprover;
        if (opts.recommendedOutcome) app.recommendedOutcome = opts.recommendedOutcome;
        if (opts.meetingId) {
          if (action.startsWith("icvd_")) app.icvdMeetingId = opts.meetingId;
          if (action.startsWith("ccic_")) app.ccicMeetingId = opts.meetingId;
        }

        deriveStatusAndStage(app, action);

        if (!app.auditTrail) app.auditTrail = [];
        app.auditTrail.push({
          actorRole: actor.role,
          actorId: actor.id,
          actionType: action,
          remark: comment ?? "",
          timestamp: new Date().toISOString(),
        });

        if (comment) {
          app.comments = {
            ...app.comments,
            _global: { needsChange: action.startsWith("revert"), comment },
          };
        }

        console.log("[Mock API] applyWorkflowAction:", { id, action, nextStep });
        return { data: { success: true } };
      },
      invalidatesTags: ["Applications"],
    }),

    deleteApplication: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay(150);
        DB_APPLICATIONS = DB_APPLICATIONS.filter((a) => a.id !== id);
        console.log("[Mock API] deleteApplication:", id);
        return { data: undefined };
      },
      invalidatesTags: ["Applications"],
    }),

    // ═══════════════════════════════════════════════════════════════════════
    // MEETINGS
    // ═══════════════════════════════════════════════════════════════════════
    getMeetings: builder.query<CommitteeMeeting[], { type?: MeetingType } | undefined>({
      queryFn: async (args = {}) => {
        await delay();
        const params = args || {};
        let result = [...DB_MEETINGS];
        if (params.type) result = result.filter((m) => m.type === params.type);
        console.log("[Mock API] getMeetings:", result.length, "records");
        return { data: result };
      },
      providesTags: ["Meetings"],
    }),

    getMeetingById: builder.query<CommitteeMeeting, string>({
      queryFn: async (id) => {
        await delay(100);
        const meeting = DB_MEETINGS.find((m) => m.id === id);
        if (!meeting) return { error: { status: 404, data: "Meeting not found" } };
        return { data: { ...meeting } };
      },
      providesTags: (result, error, id) => [{ type: "Meetings", id }],
    }),

    createMeeting: builder.mutation<CommitteeMeeting, Omit<CommitteeMeeting, "id" | "createdAt" | "updatedAt" | "votes" | "outcome">>({
      queryFn: async (data) => {
        await delay(300);
        const meeting: CommitteeMeeting = {
          ...data,
          id: crypto.randomUUID(),
          votes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        DB_MEETINGS.push(meeting);
        console.log("[Mock API] createMeeting:", meeting.id);
        return { data: meeting };
      },
      invalidatesTags: ["Meetings"],
    }),

    updateMeetingStatus: builder.mutation<void, { id: string; status: CommitteeMeeting["status"]; outcome?: "referred" | "rejected" }>({
      queryFn: async ({ id, status, outcome }) => {
        await delay(200);
        const meeting = DB_MEETINGS.find((m) => m.id === id);
        if (!meeting) return { error: { status: 404, data: "Meeting not found" } };
        meeting.status = status;
        if (outcome) meeting.outcome = outcome;
        meeting.updatedAt = new Date().toISOString();
        console.log("[Mock API] updateMeetingStatus:", id, status);
        return { data: undefined };
      },
      invalidatesTags: ["Meetings"],
    }),

    addVote: builder.mutation<void, { meetingId: string; vote: MeetingVote }>({
      queryFn: async ({ meetingId, vote }) => {
        await delay(200);
        const meeting = DB_MEETINGS.find((m) => m.id === meetingId);
        if (!meeting) return { error: { status: 404, data: "Meeting not found" } };
        meeting.votes.push(vote);
        meeting.updatedAt = new Date().toISOString();
        return { data: undefined };
      },
      invalidatesTags: ["Meetings"],
    }),
  }),
});

// ── Export hooks ──────────────────────────────────────────────────────────────
export const {
  // Auth
  useLoginMutation,
  useLoginAsDemoMutation,
  useLogoutMutation,
  useGetSessionQuery,
  // Registrations
  useGetRegistrationsQuery,
  useAddRegistrationMutation,
  useUpdateRegistrationStatusMutation,
  // Applications
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useCreatePrelimApplicationMutation,
  useUpdatePrelimDataMutation,
  useSubmitDetailedApplicationMutation,
  useApplyWorkflowActionMutation,
  useDeleteApplicationMutation,
  // Meetings
  useGetMeetingsQuery,
  useGetMeetingByIdQuery,
  useCreateMeetingMutation,
  useUpdateMeetingStatusMutation,
  useAddVoteMutation,
} = api;
