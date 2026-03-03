import React from 'react';
import { CiSearch } from "react-icons/ci";
import { heroImg } from '../../assets';

const HeroSection = () => {
  // Use your local paths or hosted URLs for these images
  const images = [
   
    "https://images.unsplash.com/photo-1595844730298-b960ff98fee0?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=500&auto=format&fit=crop"
  ];

  return (
    <section className="relative w-full">
      {/* Background Image Grid */}
      <div className="flex w-full h-[500px] md:h-[600px] overflow-hidden">
        {images.map((src, index) => (
          <div key={index} className="flex-1 h-full relative group">
            <img 
              src={src} 
              alt={`service-${index}`} 
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
            />
            {/* Dark Overlay to make text readable */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
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