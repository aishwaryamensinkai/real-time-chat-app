import React, { useState } from "react";
import { toast } from "react-toastify";
import { login } from "../../utils/api";
import { useAuth } from "../../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await login(form);
      if (response?.data?.token) {
        setAuthData(response.data);
        toast.success("Login successful!");
        console.log("Login successful:", response.data);
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div className="relative w-full mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex text-xs items-center text-gray-600 hover:text-green-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200"
        >
          Login
        </button>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link
            to="/signup"
            className="text-green-500 font-semibold hover:underline"
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
