import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Email information is missing. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      setMessage(response.data.message);

      const userId = response.data.data?.userId;

      navigate("/set-password", {
        state: {
          userId,
          email,
        },
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "OTP verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify OTP</h2>

        <p className="subtitle">
          Enter the 6-digit OTP sent to
        </p>

        <p className="email-text">{email}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {message && (
          <p className="message">{message}</p>
        )}

        <p className="bottom-text">
          Wrong email?{" "}
          <span onClick={() => navigate("/register")}>
            Register again
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;