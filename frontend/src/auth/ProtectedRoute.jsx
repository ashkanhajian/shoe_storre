import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { access } = useAuth();
  if (!access) return <Navigate to="/login" replace />;
  return children;
}
