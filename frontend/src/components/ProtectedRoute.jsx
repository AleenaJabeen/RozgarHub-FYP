import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, loading, children }) {
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secindary-500"></div>
      </div>
    );
  }

  // 1️⃣ NOT AUTHENTICATED
  if (!isAuthenticated) {
    // Allow access to Landing, Sign-up, and Reset Password
    if (path === "/" || path === "/sign-up" || path.startsWith("/reset-password")) {
      return children;
    }
    // Redirect everything else to Sign-up
    return <Navigate to="/sign-up" replace />;
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
    user.role === "customer" ? "/customer/home" : "/serviceprovider";

  // If logged in, don't let them see Landing, Sign-up, or Role Selection
  if (path === "/" || path === "/sign-up" || path === "/choose-role") {
    return <Navigate to={dashboardPath} replace />;
  }

  // 4️⃣ ROLE BASED ACCESS CONTROL (RBAC)
  if (user.role === "customer" && path.startsWith("/serviceprovider")) {
    return <Navigate to="/customer/home" replace />;
  }

  if (user.role === "serviceprovider" && path.startsWith("/customer")) {
    return <Navigate to="/serviceprovider/dashboard" replace />;
  }

  return children;
}

export default CheckAuth;