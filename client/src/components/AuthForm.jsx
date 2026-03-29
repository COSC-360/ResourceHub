import React, { useContext, useState } from "react";
import "./css/AuthForm.css";
import AuthContext from "../AuthContext.jsx";

const AuthForm = () => {
  const { login } = useContext(AuthContext);
  const { signup } = useContext(AuthContext);

  const [newUser, setNewUser] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");

  const validate = () => {
    if (password !== repeatedPassword) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newUser) {
      validate();
      signup(username, email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <legend>Welcome to ResourceHub</legend>
        <p>Login to ResourceHub</p>
        {newUser ? (
          <fieldset>
            <label htmlFor="email">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </fieldset>
        ) : null}
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
            type="text"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </fieldset>
        {newUser ? (
          <fieldset>
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              type="text"
              id="confirm_password"
              name="confirm_password"
              value={repeatedPassword}
              onChange={(e) => setRepeatedPassword(e.target.value)}
              required
            />
          </fieldset>
        ) : null}
        <div className="button_container">
          <button type="submit">Login</button>
          <button onClick={() => setNewUser(!newUser)}>
            {newUser ? "Already have an account?" : "Create new account"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
