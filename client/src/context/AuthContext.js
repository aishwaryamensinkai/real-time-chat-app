// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";
import { loginUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const result = await loginUser(email, password);
    if (result.success) {
      console.log(result);
      setToken(result.token);
      setUser(result.user);
    }
    return result.success;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token"); // Optional: Remove token from local storage if used
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
