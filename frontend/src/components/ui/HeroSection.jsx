import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { heroImg, mainVideo ,customerStep3 as heroMobileImg} from "../../assets";

const HeroSection = () => {
  const [playVideo, setPlayVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlayVideo(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);
  return (
    <section className="relative w-[95%] mx-auto my-6">
      {/* Announcement Banner */}
      <div className="w-full bg-gradient-to-r from-secondary to-emerald-500 px-6 py-4  rounded-3xl mb-6">
        <p className="text-primary text-sm md:text-base font-medium">
          Get things done faster. Hire skilled local talent on RozgarHub.
        </p>
      </div>

      {/* Hero with Video Background */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl">
        {/* Video Background */}
        <div className="absolute inset-0">
  {isMobile ? (
    <img
      src={heroMobileImg}
      alt="RozgarHub"
      className="w-full h-full object-cover"
      width={768}
      height={1024}
    />
  ) : playVideo ? (
    <video
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
    >
      <source src={mainVideo} type="video/mp4" />
    </video>
  ) : (
    <img
      src={heroImg}
      alt="RozgarHub"
      className="w-full h-full object-cover"
      width={1600}
      height={900}
    />
  )}
</div>
        {/* Left-Aligned Text Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-14 max-w-3xl z-10">
          {/* Main Headline */}
          <motion.h1
            className="text-white text-4xl md:text-6xl font-semibold leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            Connect directly with trusted local
            <span className="text-secondary/80">
              {" "}
              Service Providers
            </span> on <span className="text-secondary">RozgarHub</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-5 text-white/85 text-base md:text-lg font-normal max-w-lg leading-relaxed"
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.6 }}
          >
            Find skilled service providers near you and get the job done fast
          </motion.p>

          {/* CTA Button */}
          <motion.button
            className="mt-8 w-fit bg-secondary  text-white px-8 py-3 rounded-full font-semibold text-base transition-colors shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Hire a Service Provider Today
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroSection);
