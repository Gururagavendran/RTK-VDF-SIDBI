import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CommitteeMeeting, MeetingType, MeetingVote } from "@/lib/meetingStore";
import { mockMeetings } from "@/store/mockData";

interface MeetingsState {
  items: CommitteeMeeting[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MeetingsState = {
  items: [],
  isLoading: false,
  error: null,
};

const meetingsSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    seedMockMeetings(state) {
      if (state.items.length === 0) {
        state.items = mockMeetings;
      }
    },
    loadMeetings(state, action: PayloadAction<CommitteeMeeting[]>) {
      state.items = action.payload;
      state.isLoading = false;
    },
    createMeeting(
      state,
      action: PayloadAction<Omit<CommitteeMeeting, "id" | "createdAt" | "updatedAt" | "votes" | "outcome">>
    ) {
      const meeting: CommitteeMeeting = {
        ...action.payload,
        id: crypto.randomUUID(),
        votes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.items.push(meeting);
    },
    updateMeetingStatus(
      state,
      action: PayloadAction<{
        id: string;
        status: CommitteeMeeting["status"];
        outcome?: "referred" | "rejected";
      }>
    ) {
      const meeting = state.items.find((m) => m.id === action.payload.id);
      if (meeting) {
        meeting.status = action.payload.status;
        if (action.payload.outcome) meeting.outcome = action.payload.outcome;
        meeting.updatedAt = new Date().toISOString();
      }
    },
    addVote(
      state,
      action: PayloadAction<{ meetingId: string; vote: MeetingVote }>
    ) {
      const meeting = state.items.find((m) => m.id === action.payload.meetingId);
      if (meeting) {
        meeting.votes.push(action.payload.vote);
        meeting.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  seedMockMeetings,
  loadMeetings,
  createMeeting,
  updateMeetingStatus,
  addVote,
} = meetingsSlice.actions;
export default meetingsSlice.reducer;
