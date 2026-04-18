import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";

export const AuthContext = createContext();

// Helper function to get redirect path based on role
export const getRedirectPath = (role) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "telecaller":
      return "/telecaller/dashboard";
    case "sales":
      return "/sales/dashboard";
    default:
      return "/login";
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    const data = await authApi.login(userData);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    // Don't set user automatically so they have to login
    return data;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, getRedirectPath }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
