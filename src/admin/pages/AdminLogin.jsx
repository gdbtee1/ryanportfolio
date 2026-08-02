import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
} from "lucide-react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
  });

  const redirectPath = location.state?.from || "/admin";

  useEffect(() => {
    setStatus((current) => ({
      ...current,
      error: "",
    }));
  }, [form.email, form.password]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim();

    if (!email || !form.password) {
      setStatus({
        loading: false,
        error: "Enter your email and password.",
      });
      return;
    }

    setStatus({
      loading: true,
      error: "",
    });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: form.password,
    });

    if (error) {
      console.error("Admin login failed:", error);

      setStatus({
        loading: false,
        error: "The email or password is incorrect.",
      });
      return;
    }

    navigate(redirectPath, { replace: true });
  }

  if (authLoading) {
    return (
      <main className="cms-login-page">
        <section className="cms-login-loading">
          <LoaderCircle className="cms-spin" size={34} />
          <strong>Checking session...</strong>
        </section>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <main className="cms-login-page">
      <div className="cms-login-grid" aria-hidden="true" />

      <section className="cms-login-card">
        <div className="cms-login-brand">
          <span className="cms-login-brand-mark">R</span>

          <div>
            <strong>RYNE CMS</strong>
            <small>PORTFOLIO SYSTEM</small>
          </div>
        </div>

        <div className="cms-login-copy">
          <p className="hero-eyebrow">AUTHORIZED ACCESS</p>

          <h1>Content Manager</h1>

          <p>
            Sign in to add, edit, publish, or remove portfolio projects.
          </p>
        </div>

        <form className="cms-login-form" onSubmit={handleSubmit}>
          <label className="cms-login-field" htmlFor="admin-email">
            <span>Email address</span>

            <div className="cms-login-input">
              <Mail size={19} aria-hidden="true" />

              <input
                id="admin-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="name@example.com"
                disabled={status.loading}
              />
            </div>
          </label>

          <label className="cms-login-field" htmlFor="admin-password">
            <span>Password</span>

            <div className="cms-login-input">
              <LockKeyhole size={19} aria-hidden="true" />

              <input
                id="admin-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={status.loading}
              />
            </div>
          </label>

          {status.error && (
            <div className="cms-alert cms-alert-error" role="alert">
              {status.error}
            </div>
          )}

          <button
            type="submit"
            className="cms-btn cms-btn-primary cms-login-submit"
            disabled={status.loading}
          >
            {status.loading ? (
              <LoaderCircle className="cms-spin" size={19} />
            ) : (
              <LogIn size={19} />
            )}

            {status.loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <a className="cms-login-back-link" href="#/">
          <ArrowLeft size={17} />
          Return to website
        </a>
      </section>
    </main>
  );
}