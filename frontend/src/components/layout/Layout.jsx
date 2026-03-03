import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "../auth/AuthModal"; 
import { Outlet } from "react-router-dom";

function Layout() {
  // State to control modal visibility
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Function to open/close modal
  const toggleModal = () => setIsAuthModalOpen((prev) => !prev);

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
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}

export default Layout;