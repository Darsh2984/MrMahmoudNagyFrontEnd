import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // ❌ No token or no user → block
  if (!token || !storedUser) {
    return <Navigate to="/AccessDenied" />;
  }

  // ❌ Role not allowed → block
  if (allowedRoles && !allowedRoles.includes(storedUser.role)) {
    return <Navigate to="/AccessDenied" />;
  }

  // ❌ Student with no groupId → block
  if (storedUser.role === "student" && !storedUser.groupId) {
    return <Navigate to="/AccessDenied" />;
  }

  // ✅ Otherwise allow access
  return children;
}

export default PrivateRoute;
