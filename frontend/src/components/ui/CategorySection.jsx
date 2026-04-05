import React, { useState } from 'react';
// Importing specific icons for the Pakistani service sector
import { 
  FaWrench, FaBolt, FaCar, FaHammer, FaPaintRoller, 
  FaHardHat, FaCalendarAlt, FaTools, 
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import { 
  MdAcUnit, MdOutlineContentCut, MdOutlineGrass, MdVideocam 
} from 'react-icons/md';

const categories = [
  { name: 'Plumber', icon: <FaWrench /> },
  { name: 'Electrician', icon: <FaBolt /> },
  { name: 'Car Mechanic', icon: <FaCar /> },
  { name: 'Carpenter', icon: <FaHammer /> },
  { name: 'AC & Fridge Repair', icon: <MdAcUnit /> },
  { name: 'Painter', icon: <FaPaintRoller /> },
  { name: 'Makeup Artist', icon: <MdOutlineContentCut /> },
  { name: 'Labor Work', icon: <FaHardHat /> },
  { name: 'Event Manager', icon: <FaCalendarAlt /> },
  { name: 'Gardener', icon: <MdOutlineGrass /> },
  { name: 'CCTV Installation', icon: <MdVideocam /> },
  { name: 'Appliance Repair', icon: <FaTools /> },
];

const CategorySection = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleCategories = showAll ? categories : categories.slice(0, 8);

  return (
    <section className="py-20 px-6 bg-[#f8fafc]">
      <div className="w-[95%] mx-auto">
        
        {/* Header Section */}
        <div className=" mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
            Find Skilled <span className='text-secondary'>Physical Services</span>
          </h2>
          <div className="w-48 h-1 mx-auto rounded-full mb-6 bg-amber-400" ></div>
          <p className="text-slate-600 text-lg md:text-xl">
            Reliable experts for your home and business across Pakistan.
          </p>
        </div>

        {/* 12 Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
         {visibleCategories.map((cat, index) => (
            <div 
              key={index}
              className="group flex flex-col items-center p-6 md:p-10 bg-white rounded-3xl shadow-sm border border-gray-300 hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 cursor-pointer relative overflow-hidden"
            >
              {/* Animated Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/100 to-secondary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

              {/* Icon Circle */}
              <div 
                className="relative text-secondary z-10 text-2xl md:text-3xl mb-4 transition-all duration-500 group-hover:scale-110 group-hover:text-white"
              
              >
                {cat.icon}
              </div>

              {/* Category Name */}
              <h3 className="relative z-10 text-base md:text-xl font-bold text-tertiary group-hover:text-white transition-colors duration-300 text-center uppercase tracking-wide">
                {cat.name}
              </h3>
              
              {/* Subtle Decorative Element */}
            </div>
          ))}
        </div>
        {/* View All Button */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="cursor-pointer inline-flex items-center bg-secondary gap-2 px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all active:scale-95 hover:brightness-110"
            
          >
            {showAll ? (
              <>Show Less <FaChevronUp /></>
            ) : (
              <>View All Services <FaChevronDown /></>
            )}
          </button>
        </div>

       
      </div>
    </section>
  );
};

export default CategorySection;