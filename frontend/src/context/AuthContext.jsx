import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { axiosInstance } from "../lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [authUser, setAuthUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [authError, setAuthError] = useState("");

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem("bokbok_token");
        if (!token) {
            setIsCheckingAuth(false);
            return;
        }
        try {
            const res = await axiosInstance.get("/auth/me");
            setAuthUser(res.data.user);
        } catch {
            localStorage.removeItem("bokbok_token");
            setAuthUser(null);
        } finally {
            setIsCheckingAuth(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const signup = async (form) => {
        setAuthError("");
        try {
            const res = await axiosInstance.post("/auth/signup", form);
            localStorage.setItem("bokbok_token", res.data.token);
            setAuthUser(res.data.user);
            return true;
        } catch (err) {
            setAuthError(err.response?.data?.message || "Signup failed. Try again.");
            return false;
        }
    };

    const login = async (form) => {
        setAuthError("");
        try {
            const res = await axiosInstance.post("/auth/login", form);
            localStorage.setItem("bokbok_token", res.data.token);
            setAuthUser(res.data.user);
            return true;
        } catch (err) {
            setAuthError(err.response?.data?.message || "Login failed. Try again.");
            return false;
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch {
            // stateless JWT - nothing to clean up server-side, ignore errors
        }
        localStorage.removeItem("bokbok_token");
        setAuthUser(null);
    };

    const updateProfile = async (fields) => {
        const res = await axiosInstance.put("/auth/profile", fields);
        setAuthUser(res.data.user);
        return res.data.user;
    };

    return (
        <AuthContext.Provider
            value={{
                authUser,
                isCheckingAuth,
                authError,
                setAuthError,
                signup,
                login,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
