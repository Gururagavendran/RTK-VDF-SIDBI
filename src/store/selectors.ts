// ─────────────────────────────────────────────────────────────────────────────
// Reusable selectors for Redux store
// ─────────────────────────────────────────────────────────────────────────────

import type { RootState } from "./index";
import type { MeetingType } from "@/lib/meetingStore";

// ── Auth ─────────────────────────────────────────────────────────────────────
export const selectSession = (state: RootState) => state.auth.session;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.session;
export const selectUserType = (state: RootState) => state.auth.session?.userType;
export const selectSidbiRole = (state: RootState) => state.auth.session?.sidbiRole;

// ── Applications ─────────────────────────────────────────────────────────────
export const selectAllApplications = (state: RootState) => state.applications.items;
export const selectApplicationById = (id: string) => (state: RootState) =>
  state.applications.items.find((a) => a.id === id) ?? null;
export const selectApplicationsByEmail = (email: string) => (state: RootState) =>
  state.applications.items.filter((a) => a.applicantEmail === email);
export const selectApplicationsLoading = (state: RootState) => state.applications.isLoading;

// ── Registrations ────────────────────────────────────────────────────────────
export const selectAllRegistrations = (state: RootState) => state.registrations.items;
export const selectPendingRegistrations = (state: RootState) =>
  state.registrations.items.filter((r) => r.status === "pending");
export const selectRegistrationsLoading = (state: RootState) => state.registrations.isLoading;

// ── Meetings ─────────────────────────────────────────────────────────────────
export const selectAllMeetings = (state: RootState) => state.meetings.items;
export const selectMeetingsByType = (type: MeetingType) => (state: RootState) =>
  state.meetings.items.filter((m) => m.type === type);
export const selectMeetingById = (id: string) => (state: RootState) =>
  state.meetings.items.find((m) => m.id === id) ?? null;
