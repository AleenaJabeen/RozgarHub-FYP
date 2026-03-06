import React, { useEffect } from "react";
import { useOutletContext, useLocation, useNavigate, Outlet } from "react-router-dom";
import HeroSection from "../components/ui/HeroSection";

function Home() {
  const { toggleModal } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openAuth) {
      toggleModal();

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, toggleModal, navigate]);

  return (
    <div>
      <HeroSection onBtnClick={toggleModal} />
      <Outlet/>
    </div>
  );
}

export default Home;