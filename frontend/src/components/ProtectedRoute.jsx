import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, loading, children }) {
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    // Wait until auth check finishes
    return <div>Loading...</div>;
  }

  // 1️⃣ NOT AUTHENTICATED
  if (!isAuthenticated) {
    if (path === "/" || path.startsWith("/reset-password")) {
      return children;
    }
    return <Navigate to="/" state={{ openAuth: true }} replace />;
  }

  // 2️⃣ AUTHENTICATED BUT ROLE NOT SET
  if (user?.role === "pending" || !user?.role) {
    if (path !== "/choose-role") {
      return <Navigate to="/choose-role" replace />;
    }
    return children;
  }

  // 3️⃣ AUTHENTICATED WITH ROLE
  const dashboardPath =
    user.role === "customer" ? "/customer/home" : "/serviceprovider/dashboard";

  if (path === "/" || path === "/choose-role") {
    return <Navigate to={dashboardPath} replace />;
  }

  // 4️⃣ ROLE BASED ACCESS CONTROL
  if (user.role === "customer" && path.startsWith("/serviceprovider")) {
    return <Navigate to="/customer/home" replace />;
  }

  if (user.role === "serviceprovider" && path.startsWith("/customer")) {
    return <Navigate to="/serviceprovider/dashboard" replace />;
  }

  return children;
}

export default CheckAuth;