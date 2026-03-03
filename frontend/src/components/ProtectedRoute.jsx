import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();
  const path = location.pathname;

  // 1️⃣ Not authenticated
  // Users can only view the landing page (/). 
  // If they try to go anywhere else, send them to "/" where the modal can be triggered.
  if (!isAuthenticated) {
    if (path === "/") {
      return children;
    }
    // We pass state so the Home/Layout knows to pop up the login modal
    return <Navigate to="/" state={{ openAuth: true }} replace />;
  }

  // 2️⃣ Authenticated but role is pending
  // In your RozgarHub project, users start as 'pending' before choosing a role.
  if (!user?.role || user.role === "pending") {
    if (path === "/") {
      return children;
    }
    return <Navigate to="/" replace />;
  }

  // 3️⃣ Customer access
  // Authenticated users with the 'customer' role.
  if (user.role === "customer") {
    // If they are on a customer route, let them stay.
    // If they are on the landing page or a provider page, move them to customer home.
    if (path.startsWith("/customer")) {
      return children;
    }
    return <Navigate to="/customer/home" replace />;
  }

  // 4️⃣ Service Provider access
  // Authenticated users with the 'serviceprovider' role.
  if (user.role === "serviceprovider") {
    if (path.startsWith("/serviceprovider")) {
      return children;
    }
    return <Navigate to="/serviceprovider/dashboard" replace />;
  }

  // Catch-all redirect to the landing page
  return <Navigate to="/" replace />;
}

export default CheckAuth;