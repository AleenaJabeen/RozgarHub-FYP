import React, { useCallback, useEffect, useState } from "react";
import { login } from "../../assets";
import { useDispatch } from "react-redux";
import DOMPurify from "dompurify";
import {
  checkAuth,
  loginUser,
  registerUser,
  sendEmailOTP,
} from "../../store/auth-slice";
import { showToast } from "../../utils/toastHelper";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import VerifyEmailModal from "./VerifyEmailModal";
import { useLocation } from "react-router-dom";
import { PasswordStrengthBar } from "./PasswordStrengthBar";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { config } from "../../config";

const AuthPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // --- Modal Logic ---
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [tempUserData, setTempUserData] = useState({ email: "", password: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleGoogleLogin = () => {
    window.location.href = config.googleAuthUrl;
  };

 const handleChange = useCallback((e) => {
  const { name, value } = e.target;
  const sanitizedValue = name === "password" ? value : DOMPurify.sanitize(value);
  setFormData((prev) => ({ ...prev, [name]: sanitizedValue })); // ← also use functional update
  if (name === "password" && !isLogin) {
    const error = validatePassword(value);
    setErrors((prev) => ({ ...prev, password: error }));
  }
}, [isLogin]);

 const validate = useCallback(() => {
  let newErrors = {};
  if (!isLogin && !formData.name.trim())
    newErrors.name = "Full name is required";
  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Invalid email format";
  }
  if (!formData.password.trim()) {
    newErrors.password = "Password is required";
  } else if (!isLogin) {
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}, [isLogin, formData]);

const validatePassword = (password) => {
  const rules = [
    { test: password.length >= 8, message: "At least 8 characters" },
    { test: /[A-Z]/.test(password), message: "Add One uppercase letter(A-Z)" },
    { test: /[a-z]/.test(password), message: "Add One lowercase letter(a-z)" },
    { test: /[0-9]/.test(password), message: "Add One number(0-9)" },
    { test: /[!@#$%^&*]/.test(password), message: "One special character (!@#$%^&*)" },
  ];
  const failed = rules.filter((r) => !r.test);
  return failed.length === 0 ? null : failed[0].message;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isLogin) {
        const data = await dispatch(loginUser(formData)).unwrap();
        showToast(data.message);

        const authData = await dispatch(checkAuth()).unwrap();
        if (authData?.role && authData.role !== "pending") {
          navigate(
            authData.role === "customer" ? "/customer" : "/serviceprovider",
            { replace: true }
          );
        } else {
          navigate("/choose-role");
        }
      } else {
        const data = await dispatch(registerUser(formData)).unwrap();
        showToast(data.message);
        await dispatch(sendEmailOTP(formData.email)).unwrap();
        showToast("OTP sent to your email");

        navigate("/auth", {
          state: {
            showVerifyModal: true,
            email: formData.email,
            password: formData.password,
          },
        });
      }
    } catch (error) {
      showToast(error, "error");
      const isUnverifiedError =
      typeof error === "string" &&
      error.toLowerCase().includes("verify your email");
      console.log(isUnverifiedError)
      if (isUnverifiedError) {
      await dispatch(sendEmailOTP(formData.email)).unwrap();
        showToast("OTP sent to your email");

        navigate("/auth", {
          state: {
            showVerifyModal: true,
            email: formData.email,
            password: formData.password,
          },
        });
    }
    }
  };

  useEffect(() => {
    if (mode === "login") {
      setIsLogin(true);
    } else if (mode === "signup") {
      setIsLogin(false);
    }
    setFormData({ name: "", email: "", password: "" });
    setErrors({});
  }, [mode]);

  useEffect(() => {
    if (location.state?.showVerifyModal) {
      const { email, password } = location.state;
      setTempUserData({ email, password });
      setIsVerifyModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state]);
  return (
    <div className="flex justify-center lg:p-12 md:p-6 p-4">
      {/* Verify Modal Integration */}
      {isVerifyModalOpen && (
        <VerifyEmailModal
          isOpen={isVerifyModalOpen}
          onClose={() => {
            setIsVerifyModalOpen(false);
          }}
          email={tempUserData.email}
          password={tempUserData.password}
        />
      )}

      <div className="rounded-2xl shadow-xl border border-gray-200 w-full md:max-w-[80%] mx-auto flex flex-col md:flex-row relative">
        {/* Left Side: Image */}
        <div className="flex-1 hidden md:block md:w-1/2 relative rounded-tl-2xl rounded-bl-2xl">
          <img
            src={login}
            className="absolute inset-0 w-full  h-full lg:object-cover object-fill  rounded-tl-2xl rounded-bl-2xl"
            alt="Professionals"
          />
          <div className="relative z-20 flex flex-col justify-start h-full p-8 text-primary">
            <div className="text-center mt-4">
              <h1 className="text-4xl font-bold mb-4">Join RozgarHub</h1>
              <p className="text-lg">Find Work. Hire Workers.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 w-full md:w-1/2 p-3 md:px-0 md:py-7">
          <div className="md:px-8 px-2 py-4">
            <h2 className="sm:text-[30px] text-2xl md:text-left text-center font-semibold text-tertiary mb-8">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {!isLogin && (
                <div>
                  <input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    maxLength={50}
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-full border ${errors.name ? "border-red-500" : "border-gray-300"} focus:ring-1 focus:ring-secondary outline-none`}
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
                  className={`w-full px-4 py-3 rounded-full border ${errors.email ? "border-red-500" : "border-gray-300"} focus:ring-1 focus:ring-secondary focus:outline-none`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-4">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 rounded-full border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } focus:ring-1 focus:ring-secondary focus:outline-none outline-none `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4  top-1/2 -translate-y-1/2 focus:outline-none outline-none text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                  </button>
                </div>
                {/* Strength Bar — show only on Registration */}
                {!isLogin && formData.password && (
                  <PasswordStrengthBar password={formData.password} />
                )}

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-4">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full  bg-secondary cursor-pointer text-white font-bold py-3 rounded-full mt-6 
             transition-transform duration-150 ease-out
             hover:brightness-110
             active:scale-[0.97] active:brightness-90 shadow-md"
              >
                {isLogin ? "Log in" : "Sign up"}
              </button>
            </form>

            <div className="text-center">
              {isLogin && (
                <Link to="/reset-password">
                  <p className="text-right text-sm text-tertiary mt-2 hover:underline">
                    Forgot password?
                  </p>
                </Link>
              )}

              <p className="text-gray-600 mt-6">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({}); // Clears validation messages
                    // Reset the form data to empty strings
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                    });
                  }}
                  className="cursor-pointer text-secondary font-semibold hover:underline"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400 italic">or</span>
              </div>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="w-full cursor-pointer flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-full mb-4
             transition-all duration-200 ease-in-out
             hover:bg-gray-100  hover:shadow-md 
             active:scale-[0.98] active:bg-gray-100"
            >
              <FcGoogle size={24} />
              <span className="text-gray-700 font-medium">
                Continue with Google
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
