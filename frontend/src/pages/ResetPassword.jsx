import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage(
        "Email information is missing. Please start again.",
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setMessage(
        "Please enter a valid 6-digit OTP.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPassword.test(password)) {
      setMessage(
        "Password must contain uppercase, lowercase, number, special character and at least 8 characters.",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post(
        "/auth/reset-password",
        {
          email,
          otp,
          newPassword: password,
        },
      );

      console.log(
        "Reset password response:",
        response.data,
      );

      setMessage(
        response.data.message ||
          "Password reset successfully",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error(
        "Reset password error:",
        error,
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to reset password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Reset Password</h2>

        <p className="subtitle">
          Enter the OTP and create a new password
        </p>

        {email && (
          <p className="email-text">
            {email}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            inputMode="numeric"
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(/\D/g, ""),
              )
            }
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <p className="bottom-text">
          Back to{" "}
          <span
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

export default ResetPassword;