import React, { useEffect } from "react";
import { useOutletContext, useLocation, useNavigate, Outlet } from "react-router-dom";
import HeroSection from "../components/ui/HeroSection";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

 
  return (
    <div>
      <HeroSection  />
     
    </div>
  );
}

export default Home;