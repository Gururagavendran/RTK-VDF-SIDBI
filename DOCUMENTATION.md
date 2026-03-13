# Venture Debt Platform (SIDBI) — Frontend Documentation

This document provides a **readable, structured guide** to the frontend codebase of the Venture Debt & Incubator Fund platform (built for SIDBI). It covers architecture, major flows, core technologies, and key implementation locations.

---

## 🧩 Overview

This project is a **React + TypeScript** single-page application built with **Vite**. It uses an in-browser **mock backend** to simulate backend behavior via Redux Toolkit Query (`fakeBaseQuery`) and persists data into **localStorage**.

The UI uses **shadcn-ui** components (Radix UI + Tailwind CSS) and is structured around a workflow for:

- Applicant registration, login, and application submission
- Prelim eligibility checks
- Detailed application submission
- SIDBI review workflows (maker/checker/convenor/committee/approver)
- Committee meeting scheduling and voting
- Admin registration review

---

## 🧱 Key Tech Stack

- **React 18 + TypeScript**
- **Vite** (build + dev server)
- **Redux Toolkit** (RTK + RTK Query)
- **React Router v6**
- **Tailwind CSS**
- **shadcn-ui** (Radix UI-based components)
- **React Hook Form + Zod** (forms + validation)
- **TanStack Query** (React Query)

---

## 📁 Repo Structure (Core Areas)

### 🧬 Root
- `README.md` — generic project instructions (Lovable template)
- `package.json` — dependencies + scripts
- `vite.config.ts`, `tsconfig*.json`, `tailwind.config.ts` — build/config
- `public/application-fields.json` — canonical schema for forms

### 🧠 Source (`src/`)
- `src/main.tsx` — app root render + redux provider
- `src/App.tsx` — routing + global providers (React Query, tooltips, toasts)

### 🧩 Layout + UI
- `src/components/layout/` — page layouts & navigation:
  - `GovHeader.tsx` — public landing header
  - `GovInternal.tsx` — authenticated SIDBI layout (header + sidebar)
  - `PublicLayout.tsx` — wrapper used on public pages (login/registration)
- `src/components/ui/` — shadcn-ui components (buttons, inputs, form controls, toast, etc.)

### 📄 Pages
- `src/pages/Index.tsx` — landing page
- `src/pages/Login.tsx` — login + demo accounts
- `src/pages/Register.tsx` — applicant registration
- `src/pages/ApplicantDashboard.tsx` — applicant home
- `src/pages/PrelimApplication.tsx` — prelim eligibility
- `src/pages/DetailedApplication.tsx` — detailed application
- `src/pages/ApplicationView.tsx` — view-only application view
- SIDBI flows:
  - `SidbiDashboard.tsx`
  - `SidbiApplicationReview.tsx`
  - `CommitteeMeeting.tsx`
  - `CommitteeReview.tsx`
  - `CommitteeMeetingsList.tsx`
- Admin:
  - `AdminRegistrations.tsx`
- `NotFound.tsx` — catch-all route

### 🔁 State / Mock Backend
- `src/store/api.ts` — RTK Query API with `fakeBaseQuery` (mock backend)
- `src/store/mockData.ts` — seed data for registrations/applications/meetings
- `src/store/index.ts` — redux store setup

### 🗄️ Local Storage Helpers
- `src/lib/authStore.ts` — session storage
- `src/lib/registrationStore.ts` — registration persistence
- `src/lib/applicationStore.ts` — workflow engine + app persistence
- `src/lib/meetingStore.ts` — meeting persistence + voting

---

## 🗺️ Routing (Key Paths)

| Route | Purpose |
|------|--------|
| `/` | Landing page |
| `/login` | Login (with built-in demo accounts) |
| `/register` | Applicant registration |
| `/applicant/dashboard` | Applicant home |
| `/prelim-application` | Eligibility application |
| `/detailed-application` | Full application details |
| `/application-view/:id` | Application read-only view |
| `/sidbi/dashboard` | SIDBI dashboard |
| `/sidbi/review/:id` | SIDBI application review |
| `/sidbi/meeting/:type` | Create/edit committee meeting |
| `/sidbi/committee-review/:type/:meetingId?` | Committee voting/review |
| `/sidbi/meetings/:type` | Committee meetings list |
| `/admin/registrations` | Admin registration management |

---

## 🔁 Workflow Engine (Core Logic)

### Location (core):
- `src/lib/applicationStore.ts`

### What it contains
1. **Workflow definitions**
   - `WorkflowStep` (prelim → detailed → icvd → ccic → final → sanctioned)
   - `WorkflowAction` (approve, reject, revert, recommend, committee actions)
2. **Transition rules**
   - `workflowTransitions` (valid actions per current step)
   - `actionTransitions` (action → next step mapping)
3. **State updates**
   - `applyWorkflowAction()` validates transitions, updates status/stage, assigns reviewers, appends audit entries.
   - `getApplications()`, `getApplicationById()` and other persistence helpers (localStorage) are here.

### Workflow Behavior (high level)
- Applicant submits prelim → SIDBI maker approves → detailed stage opens
- SIDBI checker can recommend ICVD or CCIC → committee flows begin
- Committee convenor schedules meeting → members vote → decision propagates
- Final approval/sanction moves app to “sanctioned”

---

## 📄 Form Schema (single source of truth)

### File: `public/application-fields.json`

This JSON defines:
- Registration form fields
- Login form fields
- Prelim eligibility checklist
- Detailed application sections (dynamic grids, tables, file uploads)

✅ The UI renders forms based on this schema; updating it changes the form fields without code changes.

---

## 🧪 Demo Accounts (built-in test users)

### Defined in
- `src/store/api.ts` (demo accounts list)
- `src/pages/Login.tsx` (UI buttons)

### Available demo users
- `applicant@demo.com` (applicant)
- `sidbi-maker@demo.com` (maker)
- `sidbi-checker@demo.com` (checker)
- `sidbi-convenor@demo.com` (convenor)
- `sidbi-committee@demo.com` (committee member)
- `sidbi-approving@demo.com` (approving authority)
- `admin@demo.com` (admin)

---

## 🏃 Running the App

From repo root:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

---

## 🔧 Extensibility Notes

### Adding a new page + route
1. Add `src/pages/YourPage.tsx`
2. Add route entry to `src/App.tsx`
3. Use shared components (layout, UI, forms)

### Adding a new workflow action
1. Extend `WorkflowAction` in `src/lib/applicationStore.ts`
2. Extend `workflowTransitions` / `actionTransitions`
3. Update UI controls where actions are invoked

### Replacing mock backend with real API
1. Replace RTK Query `fakeBaseQuery` in `src/store/api.ts` with `fetchBaseQuery`
2. Keep endpoint names consistent (UI won’t need changes)
3. Add auth header/token handling, and adjust response shapes as needed

---

## 🧭 Where to Find Key Logic

| Area | File |
|------|------|
| Routing | `src/App.tsx` |
| Session storage | `src/lib/authStore.ts` |
| Registration persistence | `src/lib/registrationStore.ts` |
| Workflow engine | `src/lib/applicationStore.ts` |
| Committee meetings | `src/lib/meetingStore.ts` |
| Mock API | `src/store/api.ts` |
| Seed data | `src/store/mockData.ts` |
| Form schema | `public/application-fields.json` |

---

## 📝 Notes

- This project is intended as a **frontend prototype** with a mock backend.
- State is persisted in `localStorage` and seeded from `mockData.ts`.
- Most workflows are driven by workflow state + transitions; the UI is designed to limit actions based on role and workflow step.

---

If you'd like, I can also generate a **diagram** of the workflow states or create a secondary `ARCHITECTURE.md` file describing the end-to-end user journey with visual flow charts.