import React from "react";
import { useAuth } from "../context/AuthProvider";

const Navbar = () => {
  const { logout, authData } = useAuth();

  return (
    <div className="bg-green-500 text-white flex justify-between items-center p-4">
      <h1 className="text-xl font-bold">Chat App</h1>
      {authData && (
        <button
          onClick={logout}
          className="bg-white text-green-500 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Navbar;
