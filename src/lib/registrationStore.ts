export interface Registration {
  id: string;
  email: string;
  nameOfApplicant: string;
  registeredOffice: string;
  locationOfFacilities: string;
  dateOfIncorporation: string;
  dateOfCommencement: string;
  panNo: string;
  gstNo: string;
  msmeStatus: "micro" | "small" | "medium";
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const STORAGE_KEY = "venture_debt_registrations";

export function getRegistrations(): Registration[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addRegistration(reg: Omit<Registration, "id" | "status" | "submittedAt">): Registration {
  const registrations = getRegistrations();
  const newReg: Registration = {
    ...reg,
    id: crypto.randomUUID(),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  registrations.push(newReg);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  return newReg;
}

export function updateRegistrationStatus(id: string, status: "approved" | "rejected"): void {
  const registrations = getRegistrations();
  const idx = registrations.findIndex((r) => r.id === id);
  if (idx !== -1) {
    registrations[idx].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  }
}
