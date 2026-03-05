import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { MdOutlineDesignServices } from "react-icons/md";
import { updateUserRole } from "../../store/auth-slice";
import { showToast } from "../../utils/toastHelper";

const ChooseRole = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleRoleSelection = async (role) => {
    try {
      // 1. Update role in backend
       const data=await dispatch(updateUserRole(role)).unwrap();
      showToast(data.message);
      // 2. Navigate based on role
      if (role === "customer") navigate("/");
      else navigate("/serviceprovider");
    } catch (err) {
        showToast(err, "error");
      console.error("Failed to set role", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="max-w-4xl w-full p-6 text-center">
        <h1 className="text-3xl font-bold text-tertiary mb-2">Welcome to RozgarHub!</h1>
        <p className="text-gray-600 mb-10">Choose how you want to use the platform</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Option */}
          <div 
            onClick={() => handleRoleSelection("customer")}
            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-secondary cursor-pointer transition-all group"
          >
            <div className="text-5xl mb-4"><FaHome/></div>
            <h2 className="text-xl font-bold mb-2">I am a Customer</h2>
            <p className="text-gray-500">I want to hire skilled professionals for my tasks.</p>
          </div>

          {/* Provider Option */}
          <div 
            onClick={() => handleRoleSelection("serviceprovider")}
            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-secondary cursor-pointer transition-all group"
          >
            <div className="text-5xl mb-4"><MdOutlineDesignServices /></div>
            <h2 className="text-xl font-bold mb-2">I am a Service Provider</h2>
            <p className="text-gray-500">I want to offer my skills and find local work.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseRole;