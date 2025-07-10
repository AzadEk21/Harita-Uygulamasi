import { configureStore } from "@reduxjs/toolkit";
import pointReducer from "../features/points/pointSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    point: pointReducer,
    auth: authReducer
  }
});
