import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function PrivateRoute({ children, allowedRoles }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const storedUser =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

  const [isValid, setIsValid] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateUser = async () => {
      if (!token || !storedUser) {
        setIsValid(false);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/validate/${storedUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const latestUser = res.data;

        // ✅ Save back to whichever storage is used
        if (localStorage.getItem("token")) {
          localStorage.setItem("user", JSON.stringify(latestUser));
        } else {
          sessionStorage.setItem("user", JSON.stringify(latestUser));
        }

        if (allowedRoles && !allowedRoles.includes(latestUser.role)) {
          setIsValid(false);
        } else if (
          latestUser.role === "student" &&
          !latestUser.groupId
        ) {
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } catch (err) {
        console.error("❌ Validation failed:", err);

        // 🚨 Handle both unauthorized + removed from group
        if (err.response?.status === 401 || err.response?.status === 403) {
          setIsValid(false);
        } else {
          setIsValid(true); // temporary issue → keep user
        }
      } finally {
        setLoading(false);
      }
    };

    validateUser();
  }, [token, storedUser, allowedRoles]);

  if (!isValid && !loading) return <Navigate to="/AccessDenied" />;
  return children;
}

export default PrivateRoute;
