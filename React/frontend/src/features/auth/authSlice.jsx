import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login } from "./authAPI";

export const loginAsync = createAsyncThunk("auth/loginUser", async (userInfo) => {
  const data = await login(userInfo);

  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("role", data.role);
  localStorage.setItem("user", JSON.stringify({ username: data.username, role: data.role }));

  return data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    user: localStorage.getItem("username")
      ? { username: localStorage.getItem("username"), role: localStorage.getItem("role") }
      : null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.clear();  //LocalStorage temizleme
    },


    setUserFromStorage: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = {
          username: action.payload.username,
          role: action.payload.role,
        };
        state.loading = false;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});


export const { logout, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
