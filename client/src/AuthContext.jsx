"use client";
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "./lib/api-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useNavigate();

  useEffect(() => {
    const verifytoken = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const data = await apiClient(
          `http://localhost:3000/api/user/verifytoken/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setUser({
          ...data,
          access_token: token,
        });
      } catch (e) {
        console.log(e);
        localStorage.removeItem("access_token");
      }
    };
    verifytoken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient("/api/user/login", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response));

      const token = response.access_token;
      const payload = JSON.parse(atob(token.split(".")[1]));

      setUser({
        ...payload,
        access_token: token,
      });

      console.log("Token payload:", payload);

      router("/"); //change this if homepage route changes
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await apiClient("/api/user/signin", {
        method: "POST",
        body: { username, email, password },
      });
      console.log(response);

      const token = response.access_token;
      if (!token || typeof token !== "string") {
        throw new Error("Signup succeeded but no access token was returned");
      }

      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(response));

      const payload = JSON.parse(atob(token.split(".")[1]));

      setUser({
        ...payload,
        access_token: token,
      });

      router("/"); //change this if homepage route changes

      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
    router("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
