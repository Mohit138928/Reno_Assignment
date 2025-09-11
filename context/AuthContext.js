import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";

// Create auth context
const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  verifyOtp: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Request OTP login
  const login = async (email) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error requesting OTP:", error);
      return { success: false, message: "Failed to request OTP" };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and login
  const verifyOtp = async (email, otp, name = null) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, name }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Invalid OTP" };
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, message: "Failed to verify OTP" };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout");
      setUser(null);
      router.push("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyOtp,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
