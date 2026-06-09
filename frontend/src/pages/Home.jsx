import React, { useEffect } from "react";
import HeroSection from "../components/ui/HeroSection";
import HowItWorks from "../components/ui/HowItWorks";
import CategorySection from "../components/ui/CategorySection";
import TutorialSection from "../components/ui/TutorialSection";

function Home() {


 
  return (
    <div>
      <HeroSection  />
      <CategorySection/>
     <HowItWorks/>
     {/* <TutorialSection/> */}
    </div>
  );
}

export default Home;