import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession, UserType, SidbiRole } from "@/lib/authStore";

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  session: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<AuthSession>) {
      state.session = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.session = null;
      state.error = null;
    },
    restoreSession(state, action: PayloadAction<AuthSession | null>) {
      state.session = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
