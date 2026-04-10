import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForms.css";
import AuthContext from "../../AuthContext.jsx";
import { REGISTER_ROUTE } from "../../constants/RouteConstants.jsx";
import { isValidEmail, trimStr } from "../../lib/formValidation.js";

export function LoginForm() {
  const { login } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target);
    const email = trimStr(String(formData.get("email") ?? ""));
    const password = formData.get("password");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password == null || String(password).length === 0) {
      setError("Please enter your password.");
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, String(password));
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-page">
      <form className="auth-form-card" onSubmit={handleSubmit}>
        <legend>Welcome to ResourceHub</legend>
        <p className="auth-form-subtitle">Login to ResourceHub</p>
        {error ? (
          <p className="auth-form-error" role="alert">
            {error}
          </p>
        ) : null}
        <fieldset>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            required
          />
        </fieldset>
        <div className="button_container">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Login"}
          </button>
          <Link to={REGISTER_ROUTE}>
            <button type="button" className="redirect_button">
              Create new account
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
