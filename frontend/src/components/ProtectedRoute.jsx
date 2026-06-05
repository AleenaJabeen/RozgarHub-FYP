import { Navigate, useLocation } from "react-router-dom";
import RozgarHubLoader from "./layout/Loader";


function CheckAuth({ isAuthenticated, user, loading, children }) {
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return (
      <RozgarHubLoader loading={loading}/>
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

  
 if (user?.role === "pending" || !user?.role) {
  // ✅ allow auth page ONLY when verifying email
  if (
    path !== "/choose-role" &&
    !(path === "/auth" && location.state?.showVerifyModal)
  ) {
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