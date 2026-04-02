import React from "react";
import { motion } from "framer-motion";
import { heroImg, mainVideo } from "../../assets";

const HeroSection = () => {
  return (
    <section className="relative w-[95%] mx-auto my-6">
      {/* Announcement Banner */}
      <div className="w-full bg-gradient-to-r from-secondary to-emerald-500 px-6 py-4  rounded-3xl mb-6">
        <p className="text-primary text-sm md:text-base font-medium">
          Get things done faster. Hire skilled local talent on Rozgar Hub.
        </p>
      </div>

      {/* Hero with Video Background */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            poster={heroImg}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={mainVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Dark gradient overlay — stronger on left for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
        </div>

        {/* Left-Aligned Text Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-14 max-w-3xl z-10">
          {/* Main Headline */}
          <motion.h1
            className="text-white text-4xl md:text-6xl font-semibold leading-tight tracking-tight"
            initial={{ opacity: 0, x: 190 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
           Connect directly with trusted local 
service providers on <span className="text-secondary">RozgarHub</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-5 text-white/85 text-base md:text-lg font-normal max-w-lg leading-relaxed"
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.6 }}
          >
            Find skilled service providers near you
and get the job done fast
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

export default HeroSection;
