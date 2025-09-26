import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));
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
        localStorage.setItem("user", JSON.stringify(latestUser));

        if (allowedRoles && !allowedRoles.includes(latestUser.role)) {
          setIsValid(false);
        } else if (latestUser.role === "student" && !latestUser.groupId) {
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } catch (err) {
        console.error("❌ Validation failed:", err);

        // Only log out on 401, not on any random error
        if (err.response?.status === 401) {
          setIsValid(false);
        } else {
          setIsValid(true); // keep user
        }
      }


      
    };

    validateUser();
    const interval = setInterval(validateUser, 30000); // 🔁 every 30s
    return () => clearInterval(interval);
  }, [token, storedUser, allowedRoles]);

  if (!isValid && !loading) return <Navigate to="/AccessDenied" />;
  return children;
}

export default PrivateRoute;
