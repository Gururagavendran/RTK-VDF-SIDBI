// ─────────────────────────────────────────────────────────────────────────────
// mockApi.ts — Middleware that simulates async API delays for realism
// ─────────────────────────────────────────────────────────────────────────────

import type { Middleware } from "@reduxjs/toolkit";

const SIMULATED_DELAY_MS = 300;

// Actions that should have a simulated network delay
const DELAYED_ACTIONS = [
  "applications/applyWorkflowAction",
  "applications/createPrelimApplication",
  "applications/submitDetailedApplication",
  "registrations/addRegistration",
  "registrations/updateRegistrationStatus",
  "meetings/createMeeting",
  "meetings/updateMeetingStatus",
  "meetings/addVote",
  "auth/loginSuccess",
];

/**
 * Simple middleware that logs mock API "calls" to the console,
 * simulating what a real backend integration would look like.
 */
export const mockApiMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  if (DELAYED_ACTIONS.includes(action.type)) {
    console.log(
      `[Mock API] ${action.type}`,
      action.payload ? JSON.stringify(action.payload).slice(0, 200) : ""
    );
  }
  return next(action);
};
