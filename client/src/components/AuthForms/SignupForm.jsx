import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForms.css";
import AuthContext from "../../AuthContext.jsx";
import { LOGIN_ROUTE } from "../../constants/RouteConstants.jsx";
import {
  isValidEmail,
  trimStr,
  validateSignupPassword,
  validateUsername,
} from "../../lib/formValidation.js";

export function SignupForm() {
  const { signup } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const userErr = validateUsername(username);
    if (userErr) {
      setError(userErr);
      return false;
    }
    const emailTrimmed = trimStr(email);
    if (!isValidEmail(emailTrimmed)) {
      setError("Please enter a valid email address.");
      return false;
    }
    const pwErr = validateSignupPassword(password);
    if (pwErr) {
      setError(pwErr);
      return false;
    }
    if (password !== repeatedPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    const u = trimStr(username);
    const em = trimStr(email);
    setIsSubmitting(true);
    try {
      await signup(u, em, password);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Sign up failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-page">
      <form className="auth-form-card" onSubmit={handleSubmit}>
        <legend>Welcome to ResourceHub</legend>
        <p className="auth-form-subtitle">Create a new account</p>
        {error ? (
          <p className="auth-form-error" role="alert">
            {error}
          </p>
        ) : null}
        <fieldset>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={64}
            autoComplete="username"
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="confirm_password">Confirm Password</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={repeatedPassword}
            onChange={(e) => setRepeatedPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </fieldset>
        <div className="button_container">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing up…" : "Sign Up"}
          </button>
          <Link to={LOGIN_ROUTE}>
            <button type="button" className="redirect_button">
              Go to Login
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
