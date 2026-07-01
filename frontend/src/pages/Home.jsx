import React, { Suspense, lazy } from "react";
import RozgarHubLoader from "../components/layout/Loader";

const HeroSection = lazy(() => import("../components/ui/HeroSection"));
const CategorySection = lazy(() => import("../components/ui/CategorySection"));
const HowItWorks = lazy(() => import("../components/ui/HowItWorks"));
// const TutorialSection = lazy(() => import("../components/ui/TutorialSection"));

function Home() {
  return (
    <div>
      <Suspense fallback={<RozgarHubLoader/>}>
        <HeroSection />
        <CategorySection />
        <HowItWorks />
        {/* <TutorialSection /> */}
      </Suspense>
    </div>
  );
}

export default Home;