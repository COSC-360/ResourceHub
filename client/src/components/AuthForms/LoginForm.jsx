import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForms.css";
import AuthContext from "../../AuthContext.jsx";

export function LoginForm() {
  const { login } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    setIsSubmitting(true);
    try {
      await login(email, password);
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
            type="text"
            id="email"
            name="email"
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
          <Link to="/register">
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
