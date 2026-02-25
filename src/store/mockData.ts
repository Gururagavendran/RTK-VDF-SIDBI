// ─────────────────────────────────────────────────────────────────────────────
// mockData.ts — Seed data for testing the app without a backend
// ─────────────────────────────────────────────────────────────────────────────

import type { Application, AppStatus, AppStage, WorkflowStep, AuditEntry } from "@/lib/applicationStore";
import type { Registration } from "@/lib/registrationStore";
import type { CommitteeMeeting } from "@/lib/meetingStore";
import type { AuthSession } from "@/lib/authStore";

// ── Helper ────────────────────────────────────────────────────────────────────
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

// ── Mock Registrations ───────────────────────────────────────────────────────
export const mockRegistrations: Registration[] = [
  {
    id: "reg-001",
    email: "alpha@techcorp.in",
    nameOfApplicant: "Alpha TechCorp Pvt Ltd",
    registeredOffice: "301, Cyber Park, Gurugram, Haryana",
    locationOfFacilities: "Gurugram, Haryana",
    dateOfIncorporation: "2019-03-15",
    dateOfCommencement: "2019-06-01",
    panNo: "AABCT1234A",
    gstNo: "06AABCT1234A1Z5",
    msmeStatus: "small",
    status: "approved",
    submittedAt: daysAgo(30),
  },
  {
    id: "reg-002",
    email: "beta@innovations.in",
    nameOfApplicant: "Beta Innovations Ltd",
    registeredOffice: "12A, MG Road, Bengaluru, Karnataka",
    locationOfFacilities: "Bengaluru, Karnataka",
    dateOfIncorporation: "2020-08-10",
    dateOfCommencement: "2020-11-01",
    panNo: "BBBCI5678B",
    gstNo: "29BBBCI5678B1Z3",
    msmeStatus: "micro",
    status: "pending",
    submittedAt: daysAgo(5),
  },
  {
    id: "reg-003",
    email: "gamma@manufacturing.in",
    nameOfApplicant: "Gamma Manufacturing Pvt Ltd",
    registeredOffice: "Plot 45, MIDC, Pune, Maharashtra",
    locationOfFacilities: "Pune, Maharashtra",
    dateOfIncorporation: "2017-01-20",
    dateOfCommencement: "2017-04-15",
    panNo: "CCCGM9012C",
    gstNo: "27CCCGM9012C1Z8",
    msmeStatus: "medium",
    status: "approved",
    submittedAt: daysAgo(60),
  },
  {
    id: "reg-004",
    email: "delta@finserv.in",
    nameOfApplicant: "Delta FinServ Solutions",
    registeredOffice: "7th Floor, BKC, Mumbai, Maharashtra",
    locationOfFacilities: "Mumbai, Maharashtra",
    dateOfIncorporation: "2021-05-08",
    dateOfCommencement: "2021-07-20",
    panNo: "DDDFS3456D",
    gstNo: "27DDDFS3456D1Z1",
    msmeStatus: "small",
    status: "rejected",
    submittedAt: daysAgo(15),
  },
];

// ── Mock Applications ────────────────────────────────────────────────────────
const makePrelimData = (name: string) => ({
  aifName: `${name} Capital Fund`,
  businessModel: "B2B SaaS platform providing supply chain solutions",
  amountInvestedPast: "25",
  investmentAsOnDate: "40",
  additionalInvestment: "15",
  entityType: "yes",
  entityTypeRemarks: "Private Limited Company",
  vintage: "yes",
  vintageRemarks: "Incorporated 5 years ago",
  recentEquity: "yes",
  recentEquityRemarks: "Series B round closed 6 months ago",
  aggregateEquity: "yes",
  aggregateEquityRemarks: "Total AIF equity at ₹35 Cr",
  operatingIncome: "yes",
  operatingIncomeRemarks: "FY23: ₹18 Cr, FY24: ₹28 Cr",
  revenueGrowth: "yes",
  revenueGrowthRemarks: "55% YoY growth",
  netWorth: "yes",
  netWorthRemarks: "Net worth ₹42 Cr vs proposed VD ₹20 Cr",
  unitEconomics: "yes",
  unitEconomicsRemarks: "Positive contribution margin of 35%",
  cashFlow: "yes",
  cashFlowRemarks: "18-month cash runway with 30% buffer",
  existingCustomer: "no",
  existingCustomerRemarks: "New applicant",
  promoterCapital: "yes",
  promoterCapitalRemarks: "Promoter invested ₹8 Cr",
  derTotalDebt: "yes",
  derTotalDebtRemarks: "DER 1.2:1",
  derTermLoans: "yes",
  derTermLoansRemarks: "Term loan DER 0.8:1",
  debtValuation: "yes",
  debtValuationRemarks: "Debt is 6% of enterprise valuation",
  writtenOff: "yes",
  writtenOffRemarks: "No write-offs or restructuring",
  stressSma: "yes",
  stressSmaRemarks: "No SMA classification",
  regularWc: "yes",
  regularWcRemarks: "No regular WC limits",
});

const makeDetailedData = () => ({
  proposedFacility: "Term Loan",
  amountRequested: "20",
  tenureMonths: "48",
  purposeOfLoan: "Working capital augmentation and technology infrastructure",
  securityOffered: "First charge on current assets, personal guarantee of promoters",
  promoterDetails: "Mr. Rajesh Kumar (45% stake), Ms. Priya Singh (30% stake)",
  keyManagement: "CEO: Rajesh Kumar (15 yrs exp), CTO: Amit Verma (12 yrs exp)",
  financialSummary: "Revenue ₹28 Cr, EBITDA ₹6 Cr, PAT ₹3.5 Cr",
});

const makeAudit = (entries: [string, string, string][]): AuditEntry[] =>
  entries.map(([role, action, remark], i) => ({
    actorRole: role,
    actorId: `${role}-user`,
    actionType: action,
    remark,
    timestamp: daysAgo(entries.length - i),
  }));

export const mockApplications: Application[] = [
  {
    id: "app-001",
    applicantEmail: "alpha@techcorp.in",
    status: "submitted",
    stage: "prelim",
    workflowStep: "prelim_submitted",
    prelimData: makePrelimData("Alpha"),
    detailedData: null,
    comments: {},
    auditTrail: makeAudit([["applicant", "submit", "Initial submission"]]),
    submittedAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    id: "app-002",
    applicantEmail: "gamma@manufacturing.in",
    status: "approved",
    stage: "detailed",
    workflowStep: "detailed_form_open",
    prelimData: makePrelimData("Gamma"),
    detailedData: null,
    comments: {},
    auditTrail: makeAudit([
      ["applicant", "submit", "Prelim submitted"],
      ["maker", "approve_prelim", "Prelim approved — proceed to detailed"],
    ]),
    submittedAt: daysAgo(45),
    updatedAt: daysAgo(10),
  },
  {
    id: "app-003",
    applicantEmail: "gamma@manufacturing.in",
    status: "recommend_pursual",
    stage: "detailed",
    workflowStep: "detailed_checker_review",
    assignedMaker: "sidbi-maker@demo.com",
    assignedChecker: "sidbi-checker@demo.com",
    recommendedOutcome: "pursual",
    prelimData: makePrelimData("Gamma Industrial"),
    detailedData: makeDetailedData(),
    comments: {
      _global: { needsChange: false, comment: "Strong financials. Recommend pursual." },
    },
    auditTrail: makeAudit([
      ["applicant", "submit", "Prelim submitted"],
      ["maker", "approve_prelim", "Approved for detailed"],
      ["applicant", "submit_detailed", "Detailed application submitted"],
      ["maker", "recommend_pursual", "Recommend pursual — strong fundamentals"],
    ]),
    submittedAt: daysAgo(50),
    updatedAt: daysAgo(3),
  },
  {
    id: "app-004",
    applicantEmail: "alpha@techcorp.in",
    status: "reverted",
    stage: "prelim",
    workflowStep: "prelim_revision",
    prelimData: makePrelimData("Alpha Resubmit"),
    detailedData: null,
    comments: {
      _global: { needsChange: true, comment: "Please provide updated auditor's note" },
    },
    auditTrail: makeAudit([
      ["applicant", "submit", "Initial submission"],
      ["maker", "revert_prelim", "Missing auditor note — please resubmit"],
    ]),
    submittedAt: daysAgo(15),
    updatedAt: daysAgo(8),
  },
  {
    id: "app-005",
    applicantEmail: "applicant@demo.com",
    status: "submitted",
    stage: "icvd",
    workflowStep: "icvd_maker_review",
    assignedMaker: "sidbi-maker@demo.com",
    assignedChecker: "sidbi-checker@demo.com",
    recommendedOutcome: "pursual",
    prelimData: makePrelimData("Demo Corp"),
    detailedData: makeDetailedData(),
    comments: {},
    auditTrail: makeAudit([
      ["applicant", "submit", "Prelim submitted"],
      ["maker", "approve_prelim", "Approved"],
      ["applicant", "submit_detailed", "Detailed submitted"],
      ["maker", "recommend_pursual", "Recommended for pursual"],
      ["checker", "recommend_icvd", "Forwarded to ICVD"],
    ]),
    submittedAt: daysAgo(35),
    updatedAt: daysAgo(2),
  },
];

// ── Mock Meetings ────────────────────────────────────────────────────────────
export const mockMeetings: CommitteeMeeting[] = [
  {
    id: "mtg-001",
    type: "icvd",
    subject: "ICVD Meeting #1 — Q4 FY25 Applications",
    meetingNumber: 1,
    dateTime: daysAgo(-7), // 7 days in the future
    totalMembers: [
      { id: "cm1", name: "Dr. Anand Sharma", email: "anand.sharma@sidbi.com" },
      { id: "cm2", name: "Smt. Kavitha Rao", email: "kavitha.rao@sidbi.com" },
      { id: "cm3", name: "Shri Vikram Mehta", email: "vikram.mehta@sidbi.com" },
    ],
    selectedMembers: [
      { id: "cm1", name: "Dr. Anand Sharma", email: "anand.sharma@sidbi.com" },
      { id: "cm2", name: "Smt. Kavitha Rao", email: "kavitha.rao@sidbi.com" },
    ],
    makerEmail: "sidbi-maker@demo.com",
    checkerEmail: "sidbi-checker@demo.com",
    convenorEmail: "sidbi-convenor@demo.com",
    applicationIds: ["app-005"],
    status: "scheduled",
    votes: [],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
];
