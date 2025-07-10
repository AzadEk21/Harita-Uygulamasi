import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPoints } from "./pointAPI";

export const getPoints = createAsyncThunk("points/getPoints", async () => {
  const response = await fetchPoints();
  return response;
});

const pointSlice = createSlice({
  name: "points",
  initialState: {
    items: [],
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPoints.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getPoints.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(getPoints.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default pointSlice.reducer;
