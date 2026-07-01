import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  customerStep1, customerStep2, customerStep3, customerStep5, 
  providerStep1, providerStep2, providerStep3, providerStep4, providerStep5 
} from "../../assets";

// Extracted outside to avoid re-creation on every render cycle
const CONTENT_DATA = {
  customer: [
    { id: 1, title: "Create Your Profile", desc: "Sign up and set your preferences to find the right services quickly.", image: customerStep1 },
    { id: 2, title: "Choose How to Hire", desc: "Post a job, hire instantly, request inspection, or get urgent help anytime.", image: customerStep2 },
    { id: 3, title: "Connect & Confirm", desc: "Chat with service providers and finalize details before starting the work.", image: customerStep3 },
    { id: 4, title: "Work in Progress", desc: "Track progress as your selected professional completes the job.", image: customerStep2 },
    { id: 5, title: "Pay After Completion", desc: "Release payment only when you're fully satisfied with the results.", image: customerStep5 },
  ],
  provider: [
    { id: 1, title: "Create Your Profile", desc: "Build your profile to highlight your skills, experience, and expertise.", image: providerStep1 },
    { id: 2, title: "Create Gigs & Services", desc: "List your services, set pricing, and attract clients from around the world.", image: providerStep2 },
    { id: 3, title: "Set Availability", desc: "Control your schedule and enable availability for urgent or scheduled work.", image: providerStep3 },
    { id: 4, title: "Accept or Reject Orders", desc: "Review incoming requests and choose the jobs that fit your schedule.", image: providerStep4 },
    { id: 5, title: "Complete Work & Get Paid", desc: "Deliver your services and receive secure payments after completion.", image: providerStep5 },
  ],
};

const HowItWorks = () => {
  const [role, setRole] = useState("customer");

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="w-[95%] mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight mb-3">
              How it works
            </h2>
            <p className="text-base md:text-lg text-slate-500">
              Connecting customers with trusted local professionals for fast and reliable services.
            </p>
          </div>

          {/* Custom Animated Toggle */}
          <div className="relative flex bg-slate-100 rounded-full w-full sm:w-auto p-1 border border-gray-200">
            <motion.div
              className="absolute top-1 bottom-1 left-1 bg-white rounded-full border border-secondary/30 shadow-sm"
              initial={false}
              animate={{
                x: role === "customer" ? 0 : "100%",
                width: "calc(50% - 4px)",
              }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            />
            <button
              onClick={() => setRole("customer")}
              className={`flex-1 sm:flex-initial cursor-pointer relative z-10 px-6 sm:px-8 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 ${
                role === "customer" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              For hiring
            </button>
            <button
              onClick={() => setRole("provider")}
              className={`flex-1 sm:flex-initial cursor-pointer relative z-10 px-6 sm:px-8 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 ${
                role === "provider" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              For finding work
            </button>
          </div>
        </div>

        {/* Traditional Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          <AnimatePresence mode="popLayout">
            {CONTENT_DATA[role].map((item, index) => (
              <motion.div
                key={`${role}-${item.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group flex flex-col w-full"
              >
                {/* Visual Card Top Container */}
                <div className="aspect-[16/10] w-full rounded-2xl md:rounded-3xl mb-5 flex items-center justify-center overflow-hidden relative border border-slate-100 transition-transform duration-500 group-hover:shadow-md">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    loading="lazy" 
                    decoding="async"
                    className="w-full h-full object-cover select-none pointer-events-none"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />

                  {/* Subtle Grainy Overlay Effect */}
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                </div>

                {/* Text Content */}
                <div className="px-1">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-secondary transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm md:text-md">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HowItWorks);