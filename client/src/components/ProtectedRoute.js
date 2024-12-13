import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  // If token is not available, redirect to login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Render the child components if authenticated
  return children;
};

export default ProtectedRoute;
