export type UserType = "applicant" | "sidbi" | "admin";
export type SidbiRole = "maker" | "checker" | "convenor" | "committee_member" | "approving_authority";

export interface AuthSession {
  email: string;
  userType: UserType;
  sidbiRole?: SidbiRole;
}

const AUTH_KEY = "venture_debt_auth";

export function getSession(): AuthSession | null {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_KEY);
}
