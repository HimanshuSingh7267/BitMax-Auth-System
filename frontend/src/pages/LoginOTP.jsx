import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const LoginOTP = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [loginType, setLoginType] =
    useState("email");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
  if (countdown <= 0) {
    return;
  }

  const timer = setInterval(() => {
    setCountdown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const data =
        loginType === "email"
          ? { email }
          : { phone };

      const response = await api.post(
        "/auth/login-otp",
        data,
      );

      console.log(
        "Send OTP response:",
        response.data,
      );

     setOtpSent(true);
setCountdown(60);

setMessage(
  response.data.message ||
    "OTP sent successfully",
);
    } catch (error) {
      console.error(
        "Send OTP error:",
        error,
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
  if (countdown > 0) {
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const data =
      loginType === "email"
        ? { email }
        : { phone };

    const response = await api.post(
      "/auth/resend-otp",
      data,
    );

    console.log(
      "Resend OTP response:",
      response.data,
    );

    setCountdown(60);

    setMessage(
      response.data.message ||
        "OTP resent successfully",
    );
  } catch (error) {
    console.error(
      "Resend OTP error:",
      error,
    );

    setMessage(
      error.response?.data?.message ||
        "Unable to resend OTP",
    );
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setMessage(
        "Please enter a valid 6-digit OTP.",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data =
        loginType === "email"
          ? {
              email,
              otp,
            }
          : {
              phone,
              otp,
            };

      const response = await api.post(
        "/auth/verify-login-otp",
        data,
      );

      console.log(
        "Verify OTP response:",
        response.data,
      );

      const {
        accessToken,
        refreshToken,
        user,
      } = response.data.data;

      login({
        accessToken,
        refreshToken,
        user,
      });

      setMessage("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error(
        "Verify OTP error:",
        error,
      );

      setMessage(
        error.response?.data?.message ||
          "Invalid OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Login with OTP</h2>

        <p className="subtitle">
          Login securely using a one-time password
        </p>

        {!otpSent ? (
          <form onSubmit={handleSendOTP}>

            <div className="otp-type-buttons">

              <button
                type="button"
                className={
                  loginType === "email"
                    ? "active-type"
                    : "inactive-type"
                }
                onClick={() =>
                  setLoginType("email")
                }
              >
                Email
              </button>

              <button
                type="button"
                className={
                  loginType === "phone"
                    ? "active-type"
                    : "inactive-type"
                }
                onClick={() =>
                  setLoginType("phone")
                }
              >
                Phone
              </button>

            </div>

            {loginType === "email" ? (
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            ) : (
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                maxLength="10"
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(
                      /\D/g,
                      "",
                    ),
                  )
                }
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send OTP"}
            </button>

          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>

            <p className="otp-info">
              Enter the 6-digit OTP sent to your{" "}
              {loginType}.
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    "",
                  ),
                )
              }
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify & Login"}
            </button>
            <button
  type="button"
  className="resend-button"
  onClick={handleResendOTP}
  disabled={loading || countdown > 0}
>
  {countdown > 0
    ? `Resend OTP in ${countdown}s`
    : "Resend OTP"}
</button>

          </form>
        )}

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <p className="bottom-text">
          Login with password?{" "}
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

export default LoginOTP;