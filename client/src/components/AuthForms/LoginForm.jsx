import { useContext } from "react";
import { Link } from "react-router-dom";
import "./AuthForms.css";
import AuthContext from "../../AuthContext.jsx";

export function LoginForm() {
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    login(email, password);
  };

  return (
    <div className="auth-form-page">
      <form className="auth-form-card" onSubmit={handleSubmit}>
        <legend>Welcome to ResourceHub</legend>
        <p className="auth-form-subtitle">Login to ResourceHub</p>
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
          <button type="submit">Login</button>
          <Link to="/auth/register">
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
