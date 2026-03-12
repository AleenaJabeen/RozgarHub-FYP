import { ToastContainer } from "react-toastify";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"; // ✅ import useLocation
import Layout from "./components/layout/Layout";
import CheckAuth from "./components/ProtectedRoute";
import Home from "./pages/Home";
import { useDispatch, useSelector } from "react-redux";
import ForgotPassword from "./components/auth/ForgotPassword";
import ChangePassword from "./components/auth/ChangePassword";
import ChooseRole from "./components/auth/ChooseRole";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice"; 
import Profile from "./pages/serviceprovider/Profile";
import Dashboard from "./pages/serviceprovider/Dashboard";
import AuthPage from "./components/auth/AuthPage";
import ScrollToTop from "./components/layout/ScrollToTop";

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth,
  );

  // ✅ Rehydrate auth state on every page load/refresh (including Google redirect)
  useEffect(() => {
    dispatch(checkAuth());
  }, []); // ✅ Run ONCE on mount — no dependencies causing loops

  // ✅ Remove the broken navigation useEffect entirely
  // CheckAuth component handles all redirects declaratively

  return (
    <>
    <ScrollToTop/>
      <ToastContainer />

     <Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
     <Route path="auth" element={<AuthPage />} />

    <Route path="reset-password" element={<ForgotPassword />} />
    <Route path="reset-password/:token" element={<ChangePassword />} />

    <Route
      path="choose-role"
      element={
        <CheckAuth
          isAuthenticated={isAuthenticated}
          user={user}
          loading={isLoading}
        >
          <ChooseRole />
        </CheckAuth>
      }
    />

    <Route
      path="customer/*"
      element={
        <CheckAuth
          isAuthenticated={isAuthenticated}
          user={user}
          loading={isLoading}
        >
         <h2>Hi</h2>
        </CheckAuth>
      }
    />

    {/* Service Provider */}
    <Route
      path="serviceprovider"
      element={
        <CheckAuth
          isAuthenticated={isAuthenticated}
          user={user}
          loading={isLoading}
        >
         <Dashboard/>
        </CheckAuth>
      }
    >
      <Route path="profile" element={<Profile />} />
    </Route>

  </Route>
</Routes>
    </>
  );
}

export default App;
