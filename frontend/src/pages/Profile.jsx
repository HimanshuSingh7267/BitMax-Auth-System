import { useEffect, useState } from "react";
import api from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get("/auth/me");

        console.log(
          "Profile response:",
          response.data,
        );

        setUser(response.data.data.user);
      } catch (error) {
        console.error(
          "Profile error:",
          error,
        );

        setMessage(
          error.response?.data?.message ||
            "Unable to load profile",
        );
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>My Profile</h2>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        {user && (
          <>
            <p>
              <strong>Name:</strong>{" "}
              {user.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {user.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {user.phone}
            </p>

            <p>
              <strong>Verified:</strong>{" "}
              {user.isVerified
                ? "Yes"
                : "No"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;