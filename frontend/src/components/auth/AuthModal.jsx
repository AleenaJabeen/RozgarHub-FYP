import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { signupImg } from "../../assets";
import { useDispatch } from "react-redux"; // Assuming you use Redux
import { checkAuth, loginUser, registerUser } from "../../store/auth-slice";
import { showToast } from "../../utils/toastHelper";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ isOpen, onClose, openVerifyModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(false);
  const [errors, setErrors] = useState({});

  // 1. Form Data State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  // Google login
  const handleGoogleLogin = () => {
    // Directly point to your backend endpoint
    window.location.href = "http://localhost:3000/api/v1/auth/google";
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // 2. Simple Validation Logic
  const validate = () => {
    let newErrors = {};
    if (!isLogin && !formData.name.trim())
      newErrors.name = "Full name is required";
    if (!formData.email.includes("@"))
      newErrors.email = "Valid email is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 3. Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isLogin) {
        const data = await dispatch(loginUser(formData)).unwrap();
        showToast(data.message);

        const authData = await dispatch(checkAuth()).unwrap();
        onClose();
        if (authData?.role && authData.role !== "pending") {
          navigate(
            authData.role === "customer"
              ? "/customer/home"
              : "/serviceprovider/dashboard",
          );
        } else {
          navigate("/choose-role");
        }
      } else {
        const data = await dispatch(registerUser(formData)).unwrap();
        showToast(data.message);
        onClose(); // close auth modal
        openVerifyModal(formData.email, formData.password); // 👈 pass email
      }
    } catch (error) {
      showToast(error, "error"); // this will now show: "Email or User already exists"
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30  p-4">
      <div className="bg-primary rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white z-30 bg-black/20 hover:bg-black/40 rounded-full p-1 transition-all"
        >
          <IoClose size={24} />
        </button>

        {/* Left Side: Image */}
        <div className="hidden md:block md:w-1/2 h-full relative">
          <img
            src={signupImg}
            className="w-full h-full object-fill"
            alt="Professionals"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 px-8 py-6 md:px-12 md:py-7 bg-white h-full overflow-y-auto">
          <div className="max-w-md mx-auto py-4">
            <h2 className="text-[30px] font-semibold text-gray-800 mb-8">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-full border ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 ml-4">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-full border ${errors.email ? "border-red-500" : "border-gray-300"} focus:outline-none`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-4">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-full border ${errors.password ? "border-red-500" : "border-gray-300"} focus:outline-none`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-4">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-secondary hover:bg-[#0e5641] text-white font-bold py-3 rounded-full mt-4 transition-colors shadow-lg"
              >
                {isLogin ? "Log in" : "Sign up"}
              </button>
            </form>

            <div className="text-center">
              <p
                onClick={() => {
                  onClose();
                  navigate("/reset-password");
                }}
                className={`cursor-pointer text-right flex justify-end items-end mt-2 hover:underline`}
              >
                {isLogin ? "Forgot password" : ""}
              </p>
              <p className="text-gray-600 mt-4">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-blue-800 font-semibold hover:underline"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>

            {/* Divider and Google Button remain same... */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400 font-medium italic">
                  or
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-full hover:bg-gray-50 transition-colors mb-4"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
                className="w-5 h-5"
              />
              <span className="text-tertiary font-normal">
                Continue with Google
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
