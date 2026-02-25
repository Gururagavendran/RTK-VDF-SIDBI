import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Registration } from "@/lib/registrationStore";
import { mockRegistrations } from "@/store/mockData";

interface RegistrationsState {
  items: Registration[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RegistrationsState = {
  items: [],
  isLoading: false,
  error: null,
};

const registrationsSlice = createSlice({
  name: "registrations",
  initialState,
  reducers: {
    loadRegistrations(state) {
      state.isLoading = true;
    },
    loadRegistrationsSuccess(state, action: PayloadAction<Registration[]>) {
      state.items = action.payload;
      state.isLoading = false;
    },
    addRegistration(state, action: PayloadAction<Omit<Registration, "id" | "status" | "submittedAt">>) {
      const newReg: Registration = {
        ...action.payload,
        id: crypto.randomUUID(),
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      state.items.push(newReg);
    },
    updateRegistrationStatus(
      state,
      action: PayloadAction<{ id: string; status: "approved" | "rejected" }>
    ) {
      const reg = state.items.find((r) => r.id === action.payload.id);
      if (reg) reg.status = action.payload.status;
    },
    seedMockRegistrations(state) {
      if (state.items.length === 0) {
        state.items = mockRegistrations;
      }
    },
  },
});

export const {
  loadRegistrations,
  loadRegistrationsSuccess,
  addRegistration,
  updateRegistrationStatus,
  seedMockRegistrations,
} = registrationsSlice.actions;
export default registrationsSlice.reducer;
