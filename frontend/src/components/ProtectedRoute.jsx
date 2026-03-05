import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, loading, children }) {
  const location = useLocation();
  const path = location.pathname;

  if (loading) return <div>Loading...</div>; // Replace with a spinner if you have one

  // 1. Not Authenticated: Allow public routes, redirect everything else to home/login
  if (!isAuthenticated) {
    if (path === "/" || path.startsWith("/reset-password")) {
      return children;
    }
    return <Navigate to="/" state={{ openAuth: true }} replace />;
  }

  // 2. Authenticated but NO ROLE: Force them to choose-role
  if (!user?.role || user.role === "pending") {
    if (path === "/choose-role") {
      return children;
    }
    return <Navigate to="/choose-role" replace />;
  }

  // 3. Authenticated WITH ROLE: Prevent them from going back to choose-role or landing
  if (user?.role) {
    const dashboardPath = user.role === "customer" 
      ? "/customer/home" 
      : "/serviceprovider/dashboard";

    if (path === "/choose-role" || path === "/") {
      return <Navigate to={dashboardPath} replace />;
    }

    // Role-based Access Control (RBAC)
    if (user.role === "customer" && path.startsWith("/serviceprovider")) {
      return <Navigate to="/customer/home" replace />;
    }
    if (user.role === "serviceprovider" && path.startsWith("/customer")) {
      return <Navigate to="/serviceprovider/dashboard" replace />;
    }
  }

  return children;
}

export default CheckAuth;