import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "../auth/AuthModal";
import { Outlet } from "react-router-dom";
import VerifyEmailModal from "../auth/VerifyEmailModal";
import { useSelector } from "react-redux";

function Layout() {
  // State to control modal visibility
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyData, setVerifyData] = useState({ email: "", password: "" });
  const { user } = useSelector((state) => state.auth);
  const currentRole = user?.role;
  // console.log(currentRole,user)

  // Function to open/close modal
  const toggleModal = () => setIsAuthModalOpen((prev) => !prev);
  const openVerifyModal = (email,password) => {
  setVerifyData({ email, password });
    setVerifyOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Pass toggleModal to Navbar so the Login button works */}

      <Navbar role={currentRole} onOpenAuth={toggleModal} />

      <main className="flex-grow">
        {/* context allows the Home page to receive the toggleModal function */}
        <Outlet context={{ toggleModal }} />
      </main>

      <Footer />

      {/* The actual Modal component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        openVerifyModal={openVerifyModal}
      />
      <VerifyEmailModal
        isOpen={verifyOpen}
        email={verifyData.email}
        password={verifyData.password}
        onClose={() => setVerifyOpen(false)}
      />
    </div>
  );
}

export default Layout;
