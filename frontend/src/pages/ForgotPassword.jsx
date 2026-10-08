import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post(
        "/auth/forgot-password",
        {
          email,
        },
      );

      console.log(
        "Forgot password response:",
        response.data,
      );

      setMessage(
        response.data.message ||
          "OTP sent successfully",
      );

      navigate("/reset-password", {
        state: {
          email,
        },
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error,
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to send reset OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Forgot Password?</h2>

        <p className="subtitle">
          Enter your registered email to
          reset your password
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Reset OTP"}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <p className="bottom-text">
          Remember your password?{" "}
          <span
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

export default ForgotPassword;