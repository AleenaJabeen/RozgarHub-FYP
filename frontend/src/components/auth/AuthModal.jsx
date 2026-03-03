import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { signupImg } from '../../assets';
import { useDispatch } from 'react-redux'; // Assuming you use Redux
import {registerUser} from '../../store/auth-slice';
import {toast} from 'react-toastify'
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate=useNavigate();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(false);
  const [errors, setErrors] = useState({});
  
  // 1. Form Data State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

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
    if (!isLogin && !formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.includes('@')) newErrors.email = "Valid email is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 8 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 3. Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      if (isLogin) {
        console.log("Dispatching Login:", { email: formData.email, password: formData.password });
        // dispatch(loginUser({ email: formData.email, password: formData.password }));
      } else {
        console.log("Dispatching Register:", formData);
        dispatch(registerUser(formData)).then((data) => {
      console.log(data);
      const responseMessage = data?.payload?.message || "Operation successful";
      if (data?.payload?.success) {
        toast.success(responseMessage, {
          position: "bottom-right",
          autoClose: 3000,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            fontFamily: "'Inter', sans-serif",
            padding: "15px",
            color: "#0D7A5F",
            backgroundColor: "#ffffff",
            textAlign: "center",
          },
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast.error(responseMessage, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-30 bg-black/20 hover:bg-black/40 rounded-full p-1 transition-all">
          <IoClose size={24} />
        </button>

        {/* Left Side: Image */}
        <div className="hidden md:block md:w-1/2 h-full relative">
          <img src={signupImg} className="w-full h-full object-fill" alt="Professionals" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 px-8 py-6 md:px-12 md:py-8 bg-white h-full overflow-y-auto">
          <div className="max-w-md mx-auto py-4">
            <h2 className="text-[30px] font-semibold text-gray-800 mb-8">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
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
                    className={`w-full px-4 py-2 rounded-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1 ml-4">{errors.name}</p>}
                </div>
              )}
              
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-4">{errors.email}</p>}
              </div>
              
              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-4">{errors.password}</p>}
              </div>

              <button type="submit" className="w-full bg-[#126b51] hover:bg-[#0e5641] text-white font-bold py-3 rounded-full mt-4 transition-colors shadow-lg">
                {isLogin ? 'Log in' : 'Sign up'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                  className="text-blue-800 font-semibold hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
            
            {/* Divider and Google Button remain same... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;