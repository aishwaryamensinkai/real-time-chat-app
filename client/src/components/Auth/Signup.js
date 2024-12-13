import React, { useState } from "react";
import { signup } from "../../utils/api";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const Signup = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Member",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    try {
      const response = await signup(form);
      if (response?.data?.token) {
        toast.success("Signup successful! Please log in.");
        console.log("Signup successful:", response.data);
        Navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      console.error(
        "Signup failed:",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleRoleChange = (role) => {
    setForm({ ...form, role });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Signup</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-3 border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div className="relative w-full mb-4">
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
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">Role</label>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="radio"
                name="role"
                id="member"
                value="Member"
                className="mr-2"
                checked={form.role === "Member"}
                onChange={() => handleRoleChange("Member")}
              />
              <label htmlFor="member" className="text-gray-600">
                Member
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                name="role"
                id="admin"
                value="Admin"
                className="mr-2"
                checked={form.role === "Admin"}
                onChange={() => handleRoleChange("Admin")}
              />
              <label htmlFor="admin" className="text-gray-600">
                Admin
              </label>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignup}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200"
        >
          Signup
        </button>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link
            to="/login"
            className="text-green-500 font-semibold hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
