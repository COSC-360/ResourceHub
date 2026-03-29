"use client";
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const verifytoken = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/user/verifytoken/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) throw new Error();

        const data = await response.json();

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser({
          ...data,
          access_token: token,
        });
      } catch {
        localStorage.removeItem("access_token");
      }
    };
    verifytoken();
  }, []);

  const login = async (email, password) => {
    try {
      const params = new URLSearchParams();

      params.append("email", email);
      params.append("password", password);

      const response = await axios.post(
        "http://localhost:3000/api/user/login",
        params,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.access_token}`;
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data));

      const token = response.data.access_token;
      const payload = JSON.parse(atob(token.split(".")[1]));

      setUser({
        ...payload,
        access_token: token,
      });

      console.log("Token payload:", payload);

      router("/"); //change this if homepage route changes
    } catch (error) {
      console.log("Login failed:", error);
      if (error.response) {
        console.log("Response status:", error.response.status);
        console.log("Response data:", error.response.data);
      } else if (error.request) {
        console.log("No response received:", error.request);
      } else {
        console.log("Error message:", error.message);
      }
      throw new Error("Login failed");
    }
  };

  const signup = async (username, email, password) => {
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("email", email);
      params.append("password", password);
      const response = await axios.post(
        "http://localhost:3000/api/user/signin",
        params,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      console.log(response);

      const token = response.data.access_token;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("access_token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));

      setUser({
        ...payload,
        access_token: token,
      });

      router.push("/"); //change this if homepage route changes

      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("access_token");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
