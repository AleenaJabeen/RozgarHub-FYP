import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { customerStep1,customerStep2 ,customerStep3,customerStep5,providerStep1,providerStep2,providerStep3,providerStep4,providerStep5} from "../../assets";

const HowItWorks = () => {
  const [role, setRole] = useState("customer");

  const content = {
    customer: [
      {
        id: 1,
        title: "Create Your Profile",
        desc: "Sign up and set your preferences to find the right services quickly.",
        image: customerStep1,
      },
      {
        id: 2,
        title: "Choose How to Hire",
        desc: "Post a job, hire instantly, request inspection, or get urgent help anytime.",
        image: customerStep2,
      },
      {
        id: 3,
        title: "Connect & Confirm",
        desc: "Chat with service providers and finalize details before starting the work.",
        image: customerStep3,
      },
      {
        id: 4,
        title: "Work in Progress",
        desc: "Track progress as your selected professional completes the job.",
        image: customerStep2,
      },
      {
        id: 5,
        title: "Pay After Completion",
        desc: "Release payment only when you're fully satisfied with the results.",
        image: customerStep5,
      },
    ],
    provider: [
      {
        id: 1,
        title: "Create Your Profile",
        desc: "Build your profile to highlight your skills, experience, and expertise.",
        image: providerStep1,
      },
      {
        id: 2,
        title: "Create Gigs & Services",
        desc: "List your services, set pricing, and attract clients from around the world.",
        image: providerStep2,
      },
      {
        id: 3,
        title: "Set Availability",
        desc: "Control your schedule and enable availability for urgent or scheduled work.",
        image: providerStep3,
      },
      {
        id: 4,
        title: "Accept or Reject Orders",
        desc: "Review incoming requests and choose the jobs that fit your schedule.",
        image: providerStep4,
      },
      {
        id: 5,
        title: "Complete Work & Get Paid",
        desc: "Deliver your services and receive secure payments after completion.",
        image: providerStep5,
      },
    ],
  };
  return (
    <section className="py-20 bg-white">
      <div className="w-[95%] mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="md:text-4xl text-2xl  font-medium text-slate-900 tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-500">
              Connecting customers with trusted local professionals for fast and
              reliable services.
            </p>
          </div>

          {/* Custom Animated Toggle */}
          <div className=" relative flex bg-slate-100 rounded-full w-fit border border-gray-300">
            <motion.div
              className="absolute top-0 bg-white rounded-full border-2 border-secondary shadow-sm  h-[calc(100%)]"
              initial={false}
              animate={{
                x: role === "customer" ? 0 : "100%",
                width: "50%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setRole("customer")}
              className={`cursor-pointer relative z-10 px-8 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                role === "customer"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              For hiring
            </button>
            <button
              onClick={() => setRole("provider")}
              className={`cursor-pointer  relative z-10 px-8 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                role === "provider"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              For finding work
            </button>
          </div>
        </div>

        {/* Animated Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <AnimatePresence mode="wait">
            {content[role].map((item, index) => (
              <motion.div
                key={`${role}-${item.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group flex flex-col"
              >
                {/* Visual Card Top */}
                <div
                  className={`aspect-[16/10] ${item.imageColor} rounded-3xl mb-8 flex items-center justify-center overflow-hidden relative border border-slate-100 transition-transform duration-500 group-hover:scale-[1.02]`}
                >
                  <motion.img
                  src={item.image}
                  alt={item.title}
                  className="rounded-3xl  object-cover "
                    whileHover={{ scale: 1.3 }}
                    transition={{ duration: 1 }}
                  >
                    {item.icon}
                  </motion.img>

                  {/* Subtle Grainy Overlay Effect */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                </div>

                {/* Text Content */}
                <h3 className="text-2xl font-bold text-tertiary mb-3 leading-tight group-hover:text-secondary transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-md">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
