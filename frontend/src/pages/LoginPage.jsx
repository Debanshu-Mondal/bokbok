import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login, authError, setAuthError } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError("");
        setIsSubmitting(true);
        await login(form);
        setIsSubmitting(false);
    };

    return (
        <div className="auth-screen">
            <div className="pixel-panel auth-card">
                <div className="pixel-titlebar">
                    <span className="pixel-titlebar-dot" />
                    <span className="pixel-titlebar-dot" />
                    <span className="pixel-titlebar-dot" />
                  <span className="pixel-titlebar-label">bokbok://login</span>
                </div>

                <div className="auth-card-body">
                    <h1 className="brand-title">bokbok</h1>
                    <p className="brand-tagline">a tiny room to chatter with your friends</p>

                    <form onSubmit={handleSubmit} className="pixel-form">
                        <label className="pixel-field">
                            <span>email</span>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@bokbok.chat"
                                required
                                autoComplete="email"
                            />
                        </label>

                        <label className="pixel-field">
                            <span>password</span>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </label>

                        {authError && <p className="pixel-error">! {authError}</p>}

                        <button type="submit" className="pixel-btn pixel-btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "joining…" : "log in"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        new here? <Link to="/signup">create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
