import React, { useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import HeroSection from '../components/ui/HeroSection'

function Home() {
  // Get the toggle function from the Layout's Outlet context
  const { toggleModal } = useOutletContext();
  const location = useLocation();

  useEffect(() => {
    // Check if the user was redirected here by CheckAuth
    // (We passed { openAuth: true } in the Navigate component)
    if (location.state?.openAuth) {
      toggleModal();
      
      // Optional: Clear the state so the modal doesn't 
      // pop up again if the user refreshes the page.
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toggleModal]);

  return (
    <div>
      {/* Pass the toggleModal function to the Hero so the 
          "Book a Service" button can open the login modal */}
      <HeroSection onBtnClick={toggleModal} />
      
      {/* Other sections like Featured Services, etc. */}
    </div>
  );
}

export default Home;