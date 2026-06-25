import React from "react";
import { FiUser, FiFileText, FiTool, FiMapPin, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ProfileSetupPrompt() {
  const navigate=useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 px-4 py-12">
      {/* Icon Container with Floating/Pulse Effect */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-white to-slate-50 border border-slate-200/80 shadow-md flex items-center justify-center">
          <FiUser className="w-12 h-12 text-slate-400" />
        </div>
      </div>

      {/* Main Typography */}
      <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight text-center">
        Ready to kickstart your business?
      </h2>
      <p className="text-sm text-slate-500 text-center max-w-sm leading-relaxed mb-10">
        Create your profile to start appearing in local searches, showcase your elite skills, and land premium gigs near you.
      </p>

      {/* Step Progress Container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mb-10">
        {[
          { 
            step: "1", 
            icon: <FiFileText className="w-5 h-5 text-emerald-600" />, 
            label: "Add your bio & experience",
            bg: "from-emerald-500/10 to-teal-500/5"
          },
          { 
            step: "2", 
            icon: <FiTool className="w-5 h-5 text-indigo-600" />, 
            label: "List your skills & services",
            bg: "from-indigo-500/10 to-blue-500/5"
          },
          { 
            step: "3", 
            icon: <FiMapPin className="w-5 h-5 text-amber-600" />, 
            label: "Set location & go live",
            bg: "from-amber-500/10 to-orange-500/5"
          },
        ].map(({ step, icon, label, bg }) => (
          <div 
            key={step} 
            className="group relative bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-white"
          >
            {/* Step Number Badge */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold tracking-wider uppercase shadow-sm">
              Step {step}
            </div>
            
            {/* Icon Wrapper */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center mx-auto mb-3 mt-1 group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            
            <p className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors leading-snug">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Interactive CTA Section */}
      <div className="flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => navigate("/serviceprovider/createProfile")}
          className="group cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 transform active:scale-[0.98]"
        >
          <span>Create your profile</span>
          <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Takes less than 5 minutes</span>
        </div>
      </div>
    </div>
  );
}