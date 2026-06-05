import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineHeart } from "react-icons/hi";
import { TbMoodEmpty } from "react-icons/tb";
import CustomerGigCard from "../../components/customer/gigs/CustomerGigCard";
import RozgarHubLoader from "../../components/layout/Loader";

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const Wishlist = () => {
  const [savedGigs, setSavedGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedGigs = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("rozgar_saved_gigs")) || [];
        setSavedGigs(stored);
      } catch (error) {
        setSavedGigs([]);
      }
    };

    fetchSavedGigs();

    // Simulate a brief loading delay so the page transitions smoothly instead of snapping
    const timerId = setTimeout(() => {
      setLoading(false);
    }, 400);

    // Keep polling quietly in the background 
    const intervalId = setInterval(fetchSavedGigs, 1000);

    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ── Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineHeart className="text-3xl text-[#0d7a5f]" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Your Wishlist
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Keep track of your favorite services and top-rated professionals.
          </p>
        </div>
      </motion.div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <RozgarHubLoader/>
        ) : savedGigs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <TbMoodEmpty className="text-gray-200 text-7xl mb-4" />
            <p className="text-gray-500 font-bold text-lg">Your wishlist is empty</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs mb-6 leading-relaxed">
              You haven't saved any gigs yet. Browse our services and tap the heart icon to save them here.
            </p>
            <Link
              to="/customer/services"
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#0d7a5f] rounded-full hover:bg-[#095c47] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-md shadow-[#0d7a5f]/20"
            >
              Explore Services
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {savedGigs.map((gig) => (
              <motion.div key={gig._id} variants={fadeUp}>
                <CustomerGigCard gig={gig} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
    </div>
  );
};

export default Wishlist;