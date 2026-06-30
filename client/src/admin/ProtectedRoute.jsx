import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../lib/api";

export default function ProtectedRoute() {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  try {
    const decoded = jwtDecode(token);
    if (decoded.usertype === "admin" || decoded.usertype === "superadmin") {
      return <Outlet />;
    }
    return <Navigate to="/login" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
