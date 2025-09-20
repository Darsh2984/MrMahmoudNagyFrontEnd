import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const validateUser = async () => {
      if (!token || !storedUser) {
        setIsValid(false);
        return;
      }

      try {
        // ask backend for fresh data
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/validate/${storedUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const latestUser = res.data;

        // update localStorage with latest info
        localStorage.setItem("user", JSON.stringify(latestUser));

        // role check
        if (allowedRoles && !allowedRoles.includes(latestUser.role)) {
          setIsValid(false);
          return;
        }

        // student must have groupId
        if (latestUser.role === "student" && !latestUser.groupId) {
          setIsValid(false);
          return;
        }

        setIsValid(true);
      } catch (err) {
        console.error("❌ Validation failed:", err);
        setIsValid(false);
      }
    };

    validateUser();

    // 🔁 auto-refresh every 30s
    const interval = setInterval(validateUser, 10000);
    return () => clearInterval(interval);
  }, [token, storedUser, allowedRoles]);

  if (isValid === null) return <p>🔄 Checking access...</p>;
  if (!isValid) return <Navigate to="/AccessDenied" />;

  return children;
}

export default PrivateRoute;
