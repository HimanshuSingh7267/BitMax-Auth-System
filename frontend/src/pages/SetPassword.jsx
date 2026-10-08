import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;
  const email = location.state?.email;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage(
        "User information is missing. Please register again.",
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
        "/auth/set-password",
        {
          userId,
          password,
        },
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to set password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Set Password</h2>

        <p className="subtitle">
          Create a strong password for your account
        </p>

        {email && (
          <p className="email-text">
            {email}
          </p>
        )}

        <form onSubmit={handleSubmit}>
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
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : "Set Password"}
          </button>
        </form>

        {message && (
          <p className="message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default SetPassword;