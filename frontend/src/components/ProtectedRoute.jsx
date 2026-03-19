import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, loading, children }) {
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Fixed typo: border-secondary */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  // 1️⃣ NOT AUTHENTICATED
  if (!isAuthenticated) {
    // Public paths allowed for guests
    const isPublicPath = path === "/" || path === "/auth" || path.startsWith("/reset-password");
    
    if (isPublicPath) {
      return children;
    }
    return <Navigate to="/auth?mode=signup" replace />;
  }

  // 2️⃣ AUTHENTICATED BUT ROLE NOT SET
  if (user?.role === "pending" || !user?.role) {
    if (path !== "/choose-role") {
      return <Navigate to="/choose-role" replace />;
    }
    return children;
  }

  // 3️⃣ AUTHENTICATED WITH ROLE - PREVENT LANDING/AUTH ACCESS
  const dashboardPath = user.role === "customer" ? "/customer" : "/serviceprovider";

  // If user is logged in and has a role, redirect them AWAY from landing, auth, or choose-role
  if (path === "/" || path === "/auth" || path === "/choose-role") {
    return <Navigate to={dashboardPath} replace />;
  }

  // 4️⃣ ROLE BASED ACCESS CONTROL (RBAC)
  if (user.role === "customer" && path.startsWith("/serviceprovider")) {
    return <Navigate to="/customer" replace />;
  }

  if (user.role === "serviceprovider" && path.startsWith("/customer")) {
    return <Navigate to="/serviceprovider" replace />;
  }

  return children;
}

export default CheckAuth;