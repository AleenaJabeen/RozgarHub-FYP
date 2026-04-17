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
import Gig from "./pages/serviceprovider/Gig";
import CreateGig from "./components/serviceprovider/gig/CreateGig";
import ScrollToTop from "./components/layout/ScrollToTop";
import AuthPage from "./components/auth/AuthPage";
import ProviderHome from "./pages/serviceprovider/ProviderHome";
import ViewProfile from "./pages/serviceprovider/ViewProfile";
import GigDetails from "./components/serviceprovider/gig/GigDetails";
import CustomerProfile from "./pages/customer/Profile";
import CustomerHome from "./pages/customer/CustomerHome";
import ServicesPage from "./pages/customer/ServicesPage";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerViewProfile from "./pages/customer/ViewProfile";
import SPOrderManagement from "./pages/orders/serviceprovider/OrderManagement";
import CustomerOrderPage from "./pages/orders/customer/PlaceOrder";
import CustomerOrderManagement from "./pages/orders/customer/OrderManagement";
import OrderDetails from "./pages/orders/customer/OrderDetails";
import ProviderProfileView from "./pages/customer/ProviderProfileView";
import CustomerProfileView from "./pages/orders/serviceprovider/CustomerProfileView";
import OrderDetailsSP from "./pages/orders/serviceprovider/OrderDetails";

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-pulse text-white text-xl font-bold">
          RozgarHub...
        </div>
      </div>
    );
  }
  return (
    <>
      <ScrollToTop />
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <CheckAuth
                isAuthenticated={isAuthenticated}
                user={user}
                loading={isLoading}
              >
                <Home />
              </CheckAuth>
            }
          />
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
            path="customer"
            element={
              <CheckAuth
                isAuthenticated={isAuthenticated}
                user={user}
                loading={isLoading}
              >
                <CustomerHome/>
              </CheckAuth>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="view-profile" element={<CustomerViewProfile />} />
            <Route path="services" element={<ServicesPage/>} />
            <Route path="profile" element={<CustomerProfile/>}/>

            <Route path="place-order" element={<CustomerOrderPage />} />
            <Route path="orders" element={<CustomerOrderManagement />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />
            <Route path="provider/:providerId" element={<ProviderProfileView />} />
          </Route>

          {/* Service Provider */}
          <Route
            path="serviceprovider"
            element={
              <CheckAuth
                isAuthenticated={isAuthenticated}
                user={user}
                loading={isLoading}
              >
                <ProviderHome />
              </CheckAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="createProfile" element={<Profile />} />
            <Route path="view-profile" element={<ViewProfile />} />
            <Route path="gigs" element={<Gig />} />
            <Route path="createGig" element={<CreateGig />} />
            <Route path="gig-details/:id" element={<GigDetails />} />
            <Route path="orders" element={<SPOrderManagement />} />
            <Route path="orders/:orderId" element={<OrderDetailsSP />} />
            <Route path="customer/:customerId" element={<CustomerProfileView />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
