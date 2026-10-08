import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post(
        "/auth/login-password",
        {
          email,
          password,
        },
      );

      console.log("Login response:", response.data);

      const data = response.data.data;

      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      const user = data.user;

      login({
  accessToken,
  refreshToken,
  user,
});

      setMessage("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        error.response?.data?.message ||
          "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Welcome Back</h2>

        <p className="subtitle">
          Login to your BitMax account
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />
          <p className="forgot-password">
  <span
    onClick={() =>
      navigate("/forgot-password")
    }
  >
    Forgot Password?
  </span>
</p>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <p className="bottom-text">
          Don't have an account?{" "}
          <span
            onClick={() =>
              navigate("/register")
            }
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;