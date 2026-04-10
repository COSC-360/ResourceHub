"use client";
import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "./lib/api-client";
import { subscribeApiError } from "./lib/api-error-bus";
import { socket } from "./socket";
import { HOMEROUTE, INFORMATION_ROUTE } from "./constants/RouteConstants.jsx";

const AuthContext = createContext();

const VERIFY_URL = "http://localhost:3000/api/user/verifytoken/";

const decodeTokenPayload = (token) => {
  const payload = JSON.parse(atob(token.split(".")[1]));
  const rawId = payload.id ?? payload._id ?? payload.sub;
  const id = rawId != null ? String(rawId) : undefined;
  return {
    ...payload,
    id,
    admin: payload.admin ?? payload.isadmin ?? payload.isAdmin ?? false,
    isadmin: payload.isadmin ?? payload.admin ?? payload.isAdmin ?? false,
    enabled: payload.enabled ?? true,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useNavigate();
  const location = useLocation();
  const disabledLogoutHandledRef = useRef(false);

  const forceLogoutDisabled = useCallback(
    (message) => {
      if (disabledLogoutHandledRef.current) return;
      disabledLogoutHandledRef.current = true;
      localStorage.removeItem("access_token");
      localStorage.removeItem("userid");
      setUser(null);
      window.alert(
        message ||
          "Your account has been disabled. Contact an admin to reactivate your account.",
      );
      router(HOMEROUTE);
      window.setTimeout(() => {
        disabledLogoutHandledRef.current = false;
      }, 500);
    },
    [router],
  );

  const forceLogoutDisabledRef = useRef(forceLogoutDisabled);
  forceLogoutDisabledRef.current = forceLogoutDisabled;

  useEffect(() => {
    return subscribeApiError((e) => {
      if (e.payload?.code !== "ACCOUNT_DISABLED") return;
      forceLogoutDisabledRef.current(e.message);
    });
  }, []);

  useEffect(() => {
    function onAccountDisabled() {
      forceLogoutDisabledRef.current();
    }
    socket.on("account:disabled", onAccountDisabled);
    return () => socket.off("account:disabled", onAccountDisabled);
  }, []);

  useEffect(() => {
    const uid = user?.id != null ? String(user.id) : null;
    if (!uid) return;

    function joinUserRoom() {
      if (socket.connected) {
        socket.emit("joinUserSession", uid);
      }
    }

    joinUserRoom();
    socket.on("connect", joinUserRoom);

    return () => {
      socket.off("connect", joinUserRoom);
      socket.emit("leaveUserSession", uid);
    };
  }, [user?.id]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || user?.id == null) return;

    let cancelled = false;
    (async () => {
      try {
        await apiClient(VERIFY_URL, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        if (cancelled) return;
        if (e?.payload?.code === "ACCOUNT_DISABLED") {
          forceLogoutDisabledRef.current(e.message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, user?.id]);

  useEffect(() => {
    if (user?.id == null) return;

    const intervalMs = 30_000;
    const id = window.setInterval(() => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      void apiClient(VERIFY_URL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((e) => {
        if (e?.payload?.code === "ACCOUNT_DISABLED") {
          forceLogoutDisabledRef.current(e.message);
        }
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [user?.id]);

  useEffect(() => {
    const verifytoken = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        await apiClient(VERIFY_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = decodeTokenPayload(token);
        setUser({
          ...payload,
          access_token: token,
        });
      } catch (e) {
        if (e?.payload?.code === "ACCOUNT_DISABLED") {
          forceLogoutDisabledRef.current(e.message);
          return;
        }
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
        localStorage.removeItem("access_token");
        localStorage.removeItem("userid");
        window.alert(
          "Your account has been disabled. Contact an admin to reactivate your account.",
        );
        return;
      }
      router(HOMEROUTE);
    } catch (error) {
      if (error?.payload?.code === "ACCOUNT_DISABLED") {
        return;
      }
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
