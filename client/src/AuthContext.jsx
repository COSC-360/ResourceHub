"use client";
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "./lib/api-client";
import { HOMEROUTE, INFORMATION_ROUTE } from "./constants/RouteConstants.jsx";

const AuthContext = createContext();

const decodeTokenPayload = (token) => {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return {
    ...payload,
    admin: payload.admin ?? payload.isadmin ?? payload.isAdmin ?? false,
    isadmin: payload.isadmin ?? payload.admin ?? payload.isAdmin ?? false,
    enabled: payload.enabled ?? true,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useNavigate();

  useEffect(() => {
    const verifytoken = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        await apiClient(
          `http://localhost:3000/api/user/verifytoken/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const payload = decodeTokenPayload(token);
        setUser({
          ...payload,
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

      const token = response.access_token;
      const payload = decodeTokenPayload(token);

      localStorage.setItem("userid", payload.id);

      setUser({
        ...payload,
        access_token: token,
      });

      console.log("Token payload:", payload);

      if (payload.enabled === false) {
        setTimeout(() => {
          window.alert("Your account is disabled. Contact an admin to reactivate your account.");
          setUser(null);
          localStorage.removeItem("access_token");
          localStorage.removeItem("userid");
        }, 0);
      } else{
        router(HOMEROUTE);
      }
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

      const payload = decodeTokenPayload(token);

      localStorage.setItem("userid", payload.id);

      setUser({
        ...payload,
        access_token: token,
      });
      localStorage.setItem("first_time", true);
      router(INFORMATION_ROUTE);

      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("userid");
    router(HOMEROUTE);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
