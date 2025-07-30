import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    console.warn("🔒 No JWT, redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoutes;