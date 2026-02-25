import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import applicationsReducer from "./slices/applicationsSlice";
import registrationsReducer from "./slices/registrationsSlice";
import meetingsReducer from "./slices/meetingsSlice";
import { mockApiMiddleware } from "./mockApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    applications: applicationsReducer,
    registrations: registrationsReducer,
    meetings: meetingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(mockApiMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
