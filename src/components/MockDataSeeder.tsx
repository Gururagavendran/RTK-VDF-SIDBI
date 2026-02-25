// ─────────────────────────────────────────────────────────────────────────────
// MockDataSeeder — Seeds Redux store with mock data on first mount
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { seedMockApplications } from "@/store/slices/applicationsSlice";
import { seedMockRegistrations } from "@/store/slices/registrationsSlice";
import { seedMockMeetings } from "@/store/slices/meetingsSlice";
import { restoreSession } from "@/store/slices/authSlice";
import { getSession } from "@/lib/authStore";

const MockDataSeeder = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Seed mock data into Redux store
    dispatch(seedMockApplications());
    dispatch(seedMockRegistrations());
    dispatch(seedMockMeetings());

    // Restore auth session from localStorage (bridge existing authStore)
    const session = getSession();
    if (session) {
      dispatch(restoreSession(session));
    }

    console.log("[MockDataSeeder] Redux store seeded with mock data");
  }, [dispatch]);

  return <>{children}</>;
};

export default MockDataSeeder;
