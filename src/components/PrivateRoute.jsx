import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ Not logged in → send to login
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // ❌ Logged in but role not allowed → send to AccessDenied
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/Accessdenied" />;
  }

  // ✅ Logged in + allowed role → render page
  return children;
}

export default PrivateRoute;
