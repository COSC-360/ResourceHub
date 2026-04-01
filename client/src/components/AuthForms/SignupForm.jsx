import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForms.css";
import AuthContext from "../../AuthContext.jsx";

export function SignupForm(){
  const { signup } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");

  const [weakPassword, setWeakPassword] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);

  const validate = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*).{8,}$/;
    if (!passwordRegex.test(password)) {
      setWeakPassword(true);
      void(weakPassword);
      return false;
    }
    if (!emailRegex.test(email)) {
      setInvalidEmail(true);
      void(invalidEmail);
      return false;
    }
    if (password !== repeatedPassword) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validate();
    signup(username, email, password);
  };

  return (
    <div className="auth-form-page">
      <form className="auth-form-card" onSubmit={handleSubmit}>
        <legend>Welcome to ResourceHub</legend>
        <p className="auth-form-subtitle">Create a new account</p>
        <fieldset>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
          />
        </fieldset>
        <div className="button_container">
          <button type="submit">Sign Up</button>
          <Link to="/auth/login">
            <button type="button" className="redirect_button">
              Go to Login
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
