import React, { useState ,useCallback} from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "../auth/AuthModal";
import { Outlet } from "react-router-dom";
import VerifyEmailModal from "../auth/VerifyEmailModal";



function Layout() {
  // State to control modal visibility
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyData, setVerifyData] = useState({ email: "", password: "" });
  
 
const closeModal = useCallback(() => setIsAuthModalOpen(false), []);
const toggleModal = useCallback(() => {
  setIsAuthModalOpen((prev) => !prev);
}, []);
  const openVerifyModal = useCallback((email, password) => {
  setVerifyData({ email, password });
  setVerifyOpen(true);
}, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Pass toggleModal to Navbar so the Login button works */}

      <Navbar onOpenAuth={toggleModal} />

      <main className="flex-grow">
        {/* context allows the Home page to receive the toggleModal function */}
        <Outlet context={{ toggleModal }} />
      </main>

      <Footer />

      {/* The actual Modal component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
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
