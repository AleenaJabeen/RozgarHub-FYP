import { ToastContainer } from "react-toastify";
import React from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"; // ✅ import useLocation
import Layout from "./components/layout/Layout";
import CheckAuth from "./components/ProtectedRoute";
const Home = React.lazy(() => import("./pages/Home"));
const AuthPage = React.lazy(() => import("./components/auth/AuthPage"));
const ForgotPassword = React.lazy(() => import("./components/auth/ForgotPassword"));
const ChangePassword = React.lazy(() => import("./components/auth/ChangePassword"));
import ChooseRole from "./components/auth/ChooseRole";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import Profile from "./pages/serviceprovider/Profile";
const Dashboard = React.lazy(() => import("./pages/serviceprovider/Dashboard"));
import CreateGig from "./components/serviceprovider/gig/CreateGig";
import ScrollToTop from "./components/layout/ScrollToTop";
const ProviderHome = React.lazy(() => import("./pages/serviceprovider/ProviderHome"));
const Gig = React.lazy(() => import("./pages/serviceprovider/Gig"));
const ViewProfile = React.lazy(() => import("./pages/serviceprovider/ViewProfile"))
import GigDetails from "./components/serviceprovider/gig/GigDetails";
import CustomerProfile from "./pages/customer/Profile";
const CustomerHome = React.lazy(() => import("./pages/customer/CustomerHome"));
const CustomerDashboard = React.lazy(() => import("./pages/customer/Dashboard"));
const ServicesPage = React.lazy(() => import("./pages/customer/ServicesPage"));
import CustomerViewProfile from "./pages/customer/ViewProfile";
import SPOrderManagement from "./pages/orders/serviceprovider/OrderManagement";
import CustomerOrderPage from "./pages/orders/customer/PlaceOrder";
import CustomerOrderManagement from "./pages/orders/customer/OrderManagement";
import OrderDetails from "./pages/orders/customer/OrderDetails";
import ProviderProfileView from "./pages/customer/ProviderProfileView";
import CustomerProfileView from "./pages/orders/serviceprovider/CustomerProfileView";
import OrderDetailsSP from "./pages/orders/serviceprovider/OrderDetails";
import CustomerGigDetails from "./pages/customer/CustomerGigDetails";
import GlobalUrgentOverlay from "./components/orders/serviceprovider/GlobalUrgentOverlay";
import Chat from "./pages/customer/Chat";
import ChatWindow from "./components/chat/ChatWindow";
import Notification from "./pages/Notification";
import { connectSocket, disconnectSocket } from "./socket/socket";
import NoChatSelectedComponent from "./components/chat/NoChatSelectedComponent";
import { useGlobalSocket } from "./hooks/GlobalSocket";
import UserInfoPage from "./components/chat/UserInfoPage";
import Whislist from "./pages/customer/Wishlist";
import {
  initializeNotifications,
} from "./utils/notification";
import RozgarHubLoader from "./components/layout/Loader";
import SocketListener from "./hooks/SocketListener";

function App() {
   useGlobalSocket();

  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
 
  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
      const setupNotifications = async () => {
        await initializeNotifications();
      };

      setupNotifications();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user]);
 


  if (isLoading) {
    return (
      <RozgarHubLoader loading={isLoading}/>
    );
  }
  return (
    <>
      <ScrollToTop />
      <ToastContainer />
      <GlobalUrgentOverlay />
        <SocketListener />
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
         <Route
  path="auth"
  element={
    <CheckAuth
      isAuthenticated={isAuthenticated}
      user={user}
      loading={isLoading}
    >
      <AuthPage />
    </CheckAuth>
  }
/>

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
          <Route path="/user-info/:userId" element={<UserInfoPage />} />
           <Route path="/notifications" element={<Notification />} />
            <Route path="/messages" element={<Chat />}>
            <Route index element={<NoChatSelectedComponent />} />
            <Route path=":chatId" element={<ChatWindow />} />
          </Route>

          <Route
            path="customer"
            element={
              <CheckAuth
                isAuthenticated={isAuthenticated}
                user={user}
                loading={isLoading}
              >
                <CustomerHome />
              </CheckAuth>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="view-profile" element={<CustomerViewProfile />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="place-order" element={<CustomerOrderPage />} />
            <Route path="orders" element={<CustomerOrderManagement />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />
            <Route path="wishlist" element={<Whislist />} />
            <Route
              path="provider/:providerId"
              element={<ProviderProfileView />}
            />
            <Route path="services/:gigId" element={<CustomerGigDetails />} />
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
                <>
                  <ProviderHome />
                  
                </>
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
            <Route
              path="customer/:customerId"
              element={<CustomerProfileView />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
