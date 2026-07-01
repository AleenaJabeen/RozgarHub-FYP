import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { heroImg, mainVideo, login as heroMobileImg } from "../../assets";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [playVideo, setPlayVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

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
      <div className="w-full bg-gradient-to-r from-secondary to-emerald-500 px-6 py-4 rounded-3xl mb-6">
        <p className="text-primary text-sm md:text-base font-medium">
          Get things done faster. Hire skilled local talent on RozgarHub.
        </p>
      </div>

      {/* Hero Container */}
      <div className="relative w-full h-[550px] md:h-[600px] overflow-hidden rounded-2xl bg-emerald-950">
        
        {/* Background Media Container */}
        <div className="absolute inset-0 w-full h-full">
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
              className="w-full h-full object-cover object-right lg:object-center"
            >
              <source src={mainVideo} type="video/mp4" />
            </video>
          ) : (
            <img
              src={heroImg}
              alt="RozgarHub"
              className="w-full h-full object-cover object-right lg:object-center"
              width={1600}
              height={900}
            />
          )}
        </div>

        {/* Content Layer: Left-aligned and isolated from video subject using a subtle background block */}
        <div className="absolute inset-0 flex flex-col justify-start pt-12 md:pt-24 px-6 md:px-16 z-10 w-full md:max-w-2xl lg:max-w-3xl bg-gradient-to-r from-emerald-950/90 via-emerald-950/70 to-transparent">
          
          {/* Main Headline */}
          <motion.h1
            className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Connect directly with trusted local{" "}
            <span className="md:text-secondary text-white">
              Service Providers
            </span>{" "}
            on <span className="text-secondary">RozgarHub</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 text-emerald-50/90 text-base md:text-lg font-normal max-w-lg leading-relaxed drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          >
            Find skilled service providers near you and get the job done fast.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          >
            <button
              onClick={() => navigate("/auth")}
              className="mt-8 w-full sm:w-fit bg-secondary hover:bg-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold text-base transition-colors shadow-xl"
            >
              Hire a Service Provider Today
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroSection);