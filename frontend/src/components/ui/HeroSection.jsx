import React from 'react';
import { CiSearch } from "react-icons/ci";
import { heroImg } from '../../assets';

const HeroSection = () => {
  // Use your local paths or hosted URLs for these images
  const images = [
   
    heroImg
  ];

  return (
    <section className="relative w-full">
      {/* Background Image Grid */}
      <div className="flex w-full h-[500px] md:h-[600px] overflow-hidden">
       
          <div className="flex-1 h-full relative group">
            <img 
              src={heroImg} 
              alt="Services" 
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
            />
            {/* Dark Overlay to make text readable */}
            <div className="absolute inset-0 bg-black/30"></div>
       </div>
      </div>

      {/* Center Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-white text-3xl md:text-5xl font-bold max-w-3xl leading-tight">
          Your Home, Our Professionals.<br />
          Reliable Local Services, Fairly Priced.
        </h1>
        
        <button className="mt-8 bg-[#126b51] hover:bg-[#0e5641] text-white px-8 py-3 rounded-md font-semibold transition-colors">
          Book a Service Now
        </button>
      </div>

      {/* Floating Search Bar */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
        <div className="relative flex items-center bg-white rounded-full shadow-xl overflow-hidden border border-gray-200">
          <input 
            type="text" 
            placeholder="what do you need to help with?" 
            className="w-full py-4 px-8 text-gray-700 focus:outline-none text-lg"
          />
          <button className="bg-[#126b51] p-4 text-white hover:bg-[#0e5641] transition-colors">
            <CiSearch size={28} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;