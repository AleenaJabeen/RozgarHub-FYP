import React, { useState } from 'react';
import { FaUserCircle, FaArrowRight, FaCheck } from 'react-icons/fa';
import { MdDesignServices } from 'react-icons/md';
import { heroImg } from '../../assets';
import { showToast } from '../../utils/toastHelper';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUserRole } from '../../store/auth-slice';

const ChooseRole = () => {
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
  };

  const onContinue = async () => {
    if (!selectedRole) return;
    try {
      const data = await dispatch(updateUserRole(selectedRole)).unwrap();
      showToast(data.message);
      navigate(selectedRole === "customer" ? "/customer" : "/serviceprovider");
    } catch (err) {
      showToast(err, "error");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-[#1F2937] bg-cover bg-center bg-no-repeat p-4 relative"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Main Glassmorphism Box */}
      <div className="relative z-10 max-w-xl w-full p-8 md:p-12 bg-primary/10  rounded-[2rem] border border-white/20 shadow-2xl text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
          Welcome to RozgarHub!
        </h1>
        <p className="text-gray-300 mb-10 text-lg">How would you like to use our platform?</p>

        <div className="space-y-4">
          {/* Customer Choice */}
          <div 
            onClick={() => handleRoleSelection("customer")}
            className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 
              ${selectedRole === "customer" 
                ? "bg-secondary/20 border-secondary shadow-[0_0_15px_rgba(var(--secondary-rgb),0.3)]" 
                : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl 
              ${selectedRole === "customer" ? "bg-secondary text-white" : "bg-white/10 text-gray-400"}`}>
              <FaUserCircle />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-white font-bold text-lg">I am a Customer</h3>
              <p className="text-gray-400 text-sm">I want to hire skilled professionals</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${selectedRole === "customer" ? "border-secondary bg-secondary" : "border-white/20"}`}>
              {selectedRole === "customer" && <FaCheck className="text-white text-xs" />}
            </div>
          </div>

          {/* Provider Choice */}
          <div 
            onClick={() => handleRoleSelection("serviceprovider")}
            className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 
              ${selectedRole === "serviceprovider" 
                ? "bg-secondary/20 border-secondary shadow-[0_0_15px_rgba(var(--secondary-rgb),0.3)]" 
                : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl 
              ${selectedRole === "serviceprovider" ? "bg-secondary text-white" : "bg-white/10 text-gray-400"}`}>
              <MdDesignServices />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-white font-bold text-lg">I am a Service Provider</h3>
              <p className="text-gray-400 text-sm">I want to offer my skills and find work</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${selectedRole === "serviceprovider" ? "border-secondary bg-secondary" : "border-white/20"}`}>
              {selectedRole === "serviceprovider" && <FaCheck className="text-white text-xs" />}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          disabled={!selectedRole}
          onClick={onContinue}
          className={`cursor-pointer mt-10 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
            ${selectedRole 
              ? "bg-secondary text-white hover:scale-[1.02] shadow-lg" 
              : "bg-white/10 text-gray-500 cursor-not-allowed"}`}
        >
          Continue <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default ChooseRole;