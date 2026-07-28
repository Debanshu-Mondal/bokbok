import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
    const { signup, authError, setAuthError } = useAuth();
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError("");
        setIsSubmitting(true);
        await signup(form);
        setIsSubmitting(false);
    };

    return (
        <div className="auth-screen">
            <div className="pixel-panel auth-card">
                <div className="pixel-titlebar">
                    <span className="pixel-titlebar-dot" />
                    <span className="pixel-titlebar-dot" />
                    <span className="pixel-titlebar-dot" />
                    <span className="pixel-titlebar-label">bokbok://signup</span>
                </div>

                <div className="auth-card-body">
                    <h1 className="brand-title">bokbok</h1>
                    <p className="brand-tagline">hatch a new account</p>

                    <form onSubmit={handleSubmit} className="pixel-form">
                        <label className="pixel-field">
                            <span>username</span>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="littlehen"
                                minLength={3}
                                maxLength={20}
                                required
                                autoComplete="username"
                            />
                        </label>

                        <label className="pixel-field">
                            <span>email</span>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="hen@coop.com"
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
                                placeholder="6+ characters"
                                minLength={6}
                                required
                                autoComplete="new-password"
                            />
                        </label>

                        {authError && <p className="pixel-error">! {authError}</p>}

                        <button type="submit" className="pixel-btn pixel-btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "hatching…" : "sign up"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        already have a nest? <Link to="/login">log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
