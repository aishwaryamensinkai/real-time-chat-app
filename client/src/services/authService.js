// src/services/authService.js

const API_BASE_URL = "https://real-time-chat-app-6vra.onrender.com/api/auth";

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to log in");
    }

    const data = await response.json();

    return { success: true, token: data.token, user: data.user };
  } catch (error) {
    console.error("Login error:", error.message);
    return { success: false, message: error.message };
  }
};

export const signupUser = async (username, email, password, role) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to sign up");
    }

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error.message);
    return { success: false, message: error.message };
  }
};
