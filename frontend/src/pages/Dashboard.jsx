import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [loginHistory, setLoginHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        const response = await api.get(
          "/auth/login-history",
        );

        console.log(
          "Login history response:",
          response.data,
        );

        const history =
          response.data?.data?.history || [];

        setLoginHistory(history);
      } catch (error) {
        console.error(
          "Login history error:",
          error,
        );

        setHistoryError(
          error.response?.data?.message ||
            "Unable to load login history",
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchLoginHistory();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatLoginMethod = (method) => {
    switch (method) {
      case "email-otp":
        return "Email OTP";

      case "phone-otp":
        return "Phone OTP";

      case "password":
        return "Password";

      default:
        return method || "Unknown";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome to BitMax</h1>
            <p>Authentication Dashboard</p>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* User Information */}
        <div className="user-section">
          <h2>User Information</h2>

          <div className="user-info">
            <div className="info-row">
              <span>Name</span>
              <strong>
                {user?.name || "N/A"}
              </strong>
            </div>

            <div className="info-row">
              <span>Email</span>
              <strong>
                {user?.email || "N/A"}
              </strong>
            </div>

            <div className="info-row">
              <span>Phone</span>
              <strong>
                {user?.phone || "N/A"}
              </strong>
            </div>

            <div className="info-row">
              <span>Verified</span>
              <strong>
                {user?.isVerified
                  ? "Yes"
                  : "No"}
              </strong>
            </div>
          </div>
        </div>

        {/* Profile Button */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => navigate("/profile")}
          >
            View Profile
          </button>
        </div>

        {/* Login History */}
        <div className="login-history-section">
          <h2>Login History</h2>

          {historyLoading && (
            <p>Loading login history...</p>
          )}

          {!historyLoading &&
            historyError && (
              <p className="message">
                {historyError}
              </p>
            )}

          {!historyLoading &&
            !historyError &&
            loginHistory.length === 0 && (
              <p className="history-empty">
                No login history available.
              </p>
            )}

          {!historyLoading &&
            !historyError &&
            loginHistory.length > 0 && (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Login Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loginHistory.map(
                      (item, index) => (
                        <tr
                          key={
                            item._id || index
                          }
                        >
                          <td>
                            {formatDate(
                              item.createdAt,
                            )}
                          </td>

                          <td>
                            {formatLoginMethod(
                              item.loginMethod,
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                item.status ===
                                "success"
                                  ? "status-success"
                                  : "status-failed"
                              }
                            >
                              {item.status ===
                              "success"
                                ? "Success"
                                : "Failed"}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;