// ─────────────────────────────────────────────────────────────────────────────
// meetingStore.ts — Committee meeting management (ICVD & CCIC-CGM)
// ─────────────────────────────────────────────────────────────────────────────

export type MeetingType = "icvd" | "ccic";

export interface CommitteeMember {
  id: string;
  name: string;
  email: string;
}

export interface MeetingVote {
  memberId: string;
  vote: "approve" | "reject" | "abstain";
  comment: string;
  timestamp: string;
}

export interface CommitteeMeeting {
  id: string;
  type: MeetingType;
  subject: string;
  meetingNumber: number;
  dateTime: string;
  // Members
  totalMembers: CommitteeMember[];
  selectedMembers: CommitteeMember[];
  // Team
  makerEmail: string;
  checkerEmail: string;
  convenorEmail: string;
  approverEmail?: string; // Only for CCIC
  // Applications
  applicationIds: string[];
  // Status
  status: "draft" | "scheduled" | "in_progress" | "completed";
  // Votes
  votes: MeetingVote[];
  outcome?: "referred" | "rejected";
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "venture_debt_meetings";

// Predefined pool of committee members
export const COMMITTEE_MEMBERS_POOL: CommitteeMember[] = [
  { id: "cm1", name: "Dr. Anand Sharma", email: "anand.sharma@sidbi.com" },
  { id: "cm2", name: "Smt. Kavitha Rao", email: "kavitha.rao@sidbi.com" },
  { id: "cm3", name: "Shri Vikram Mehta", email: "vikram.mehta@sidbi.com" },
  { id: "cm4", name: "Smt. Neelam Gupta", email: "neelam.gupta@sidbi.com" },
  { id: "cm5", name: "Shri Rajendra Prasad", email: "rajendra.prasad@sidbi.com" },
];

export const MOCK_CONVENORS = [
  { id: "conv1", name: "Shri Suresh Iyer", email: "suresh.iyer@sidbi.com" },
  { id: "conv2", name: "Smt. Meera Joshi", email: "meera.joshi@sidbi.com" },
];

export const MOCK_APPROVERS = [
  { id: "appr1", name: "Shri G.K. Nair (CGM)", email: "approving.authority@sidbi.com" },
];

function getMeetings(): CommitteeMeeting[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveMeetings(meetings: CommitteeMeeting[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
}

export function getAllMeetings(): CommitteeMeeting[] {
  return getMeetings();
}

export function getMeetingsByType(type: MeetingType): CommitteeMeeting[] {
  return getMeetings().filter((m) => m.type === type);
}

export function getMeetingById(id: string): CommitteeMeeting | null {
  return getMeetings().find((m) => m.id === id) ?? null;
}

export function getNextMeetingNumber(type: MeetingType): number {
  const meetings = getMeetingsByType(type);
  return meetings.length + 1;
}

export function createMeeting(meeting: Omit<CommitteeMeeting, "id" | "createdAt" | "updatedAt" | "votes" | "outcome">): CommitteeMeeting {
  const meetings = getMeetings();
  const newMeeting: CommitteeMeeting = {
    ...meeting,
    id: crypto.randomUUID(),
    votes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  meetings.push(newMeeting);
  saveMeetings(meetings);
  return newMeeting;
}

export function updateMeetingStatus(id: string, status: CommitteeMeeting["status"], outcome?: "referred" | "rejected"): void {
  const meetings = getMeetings();
  const idx = meetings.findIndex((m) => m.id === id);
  if (idx !== -1) {
    meetings[idx].status = status;
    if (outcome) meetings[idx].outcome = outcome;
    meetings[idx].updatedAt = new Date().toISOString();
    saveMeetings(meetings);
  }
}

export function addVoteToMeeting(meetingId: string, vote: MeetingVote): void {
  const meetings = getMeetings();
  const idx = meetings.findIndex((m) => m.id === meetingId);
  if (idx !== -1) {
    meetings[idx].votes.push(vote);
    meetings[idx].updatedAt = new Date().toISOString();
    saveMeetings(meetings);
  }
}

/** Simulate email notification — logs to audit trail and shows toast */
export function simulateEmail(recipients: string[], subject: string, body: string): void {
  console.log(`[EMAIL SIMULATION] To: ${recipients.join(", ")} | Subject: ${subject} | Body: ${body}`);
}
