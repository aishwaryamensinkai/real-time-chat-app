import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  _id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  message: null,
  isAuthenticated: false,
};

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData: { username: string; email: string; password: string; role: string }, { rejectWithValue }) => {
    try {
      // console.log("Signup API call initiated with data:", userData);
      const response = await axios.post(
        "https://real-time-chat-app-6vra.onrender.com/api/auth/signup",
        userData
      );
      // console.log("Signup API response:", response.data);
      return response.data;
    } catch (error: any) {
      // console.error("Signup API error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Signup failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (user: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // console.log("Login API call initiated with data:", user);
      const response = await axios.post(
        "https://real-time-chat-app-6vra.onrender.com/api/auth/login",
        user
      );
      // console.log("Login API response:", response.data);
      return response.data;
    } catch (error: any) {
      // console.error("Login API error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Login failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log("Forgot Password API call initiated with email:", email);
      const response = await axios.post(
        "https://real-time-chat-app-6vra.onrender.com/api/auth/forgot-password",
        { email }
      );
      console.log("Forgot Password API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Forgot Password API error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Forgot password request failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token, newPassword }: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Reset Password API call initiated with token:", token);
      const response = await axios.post(
        "https://real-time-chat-app-6vra.onrender.com/api/auth/reset-password",
        { token, newPassword }
      );
      console.log("Reset Password API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Reset Password API error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Password reset failed");
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.token) {
        return rejectWithValue("No token found");
      }
      const response = await axios.get(
        "https://real-time-chat-app-6vra.onrender.com/api/auth/status",
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Authentication failed");
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.message = "Signup successful. Please log in.";
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

