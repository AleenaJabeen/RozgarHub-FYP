import React, { useState, useRef, useEffect } from "react";
import {
  IoMenu,
  IoClose,
  IoLogOutOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { Logo2 } from "../../assets";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/auth-slice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { showToast } from "../../utils/toastHelper";
import { capitalizeWords } from '../../utils/capitalize';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const role = user?.role || "pending";
  const name = user?.name || "User";
  const email = user?.email || "";
  const avatar = user?.avatar || "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const data = await dispatch(logoutUser()).unwrap();
      showToast(data.message || "Logged out successfully");
      setIsDropdownOpen(false);
      setIsOpen(false);
      navigate("/");
    } catch (error) {
      showToast(error, "error");
    }
  };

  const navLinks = {
    pending: [{ name: "Services", href: "/services" }],
    customer: [
      { name: "Home", href: "/customer" },
      { name: "Services", href: "/services" },
      { name: "Orders", href: "/orders" },
      { name: "Inbox", href: "/inbox" },
    ],
    serviceprovider: [
      { name: 'Home', href: '/serviceprovider' }, // Renamed from Dashboard to Home
      { name: 'Gigs', href: '/serviceprovider/gigs' },
      { name: 'Orders', href: '/serviceprovider/orders' },
    ]
  };

  const currentLinks = navLinks[role] || navLinks.pending;

  return (
    <nav className="bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <img 
              src={Logo2} 
              alt="RozgarHub" 
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8">
              {currentLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative group text-gray-600 font-semibold transition-colors py-2"
                >
                  <span className="group-hover:text-secondary transition-colors duration-300">
                    {link.name}
                  </span>
                  {/* Animated Underline */}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ))}
            </div>

            {role === "pending" ? (
              <div className="flex items-center space-x-5 ml-4 border-l border-gray-200 pl-8">
                <Link
                  to="/auth?mode=login"
                  className="text-gray-600 font-semibold hover:text-secondary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold shadow-md shadow-secondary/20 hover:bg-[#0e5641] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Join Now
                </Link>
              </div>
            ) : (
              <div className="relative ml-4 border-l border-gray-200 pl-8" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 group focus:outline-none"
                >
                  <div className={`w-11 h-11 rounded-full border-2 overflow-hidden transition-all duration-300 ${isDropdownOpen ? 'border-secondary shadow-md shadow-secondary/20' : 'border-gray-200 group-hover:border-secondary/50'}`}>
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg">
                        {name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </button>

                {/* Desktop Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Dropdown Header */}
                    <div className="flex items-center p-4 bg-gray-50/50 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-white flex items-center justify-center text-secondary font-bold">
                            {name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {capitalizeWords(name)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{email}</p>
                      </div>
                    </div>

                    {/* Dropdown Links */}
                    <div className="py-2">
                      <Link
                        to={role === "serviceprovider" ? "/serviceprovider/view-profile" : "/customer/view-profile"}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-secondary/5 hover:text-secondary transition-colors"
                      >
                        <IoPersonOutline className="text-lg" />
                        Profile Settings
                      </Link>
                    </div>

                    {/* Dropdown Footer */}
                    <div className="border-t border-gray-100 p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <IoLogOutOutline className="text-lg" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-secondary transition-colors p-2 focus:outline-none"
            >
              {isOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Container */}
      {isOpen && (
        <div className="md:hidden bg-white fixed inset-x-0 top-20 bottom-0 z-50 overflow-y-auto border-t border-gray-100 animate-in slide-in-from-right-full duration-300">
          
          {role !== "pending" && (
            <div className="px-6 py-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full border-2 border-secondary shadow-md overflow-hidden flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-secondary/10 h-full w-full flex items-center justify-center text-secondary text-xl font-bold">
                    {name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-lg text-gray-800 truncate">{capitalizeWords(name)}</h3>
                <p className="text-sm text-gray-500 truncate">{email}</p>
              </div>
            </div>
          )}

          <div className="px-4 py-4 space-y-1">
            {currentLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block px-4 py-3 text-base font-semibold text-gray-700 hover:bg-secondary/10 hover:text-secondary rounded-xl transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {role !== "pending" && (
              <Link
                to={role === "serviceprovider" ? "/serviceprovider/view-profile" : "/customer/view-profile"}
                className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-gray-700 hover:bg-secondary/10 hover:text-secondary rounded-xl transition-colors mt-2"
              >
                <IoPersonOutline className="text-xl text-gray-400" />
                Profile Settings
              </Link>
            )}

            <div className="pt-6 mt-4 border-t border-gray-100">
              {role === "pending" ? (
                <div className="space-y-3 px-2">
                  <Link
                    to="/auth?mode=login"
                    className="block text-center w-full py-3.5 font-bold text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className="block text-center w-full py-3.5 font-bold bg-secondary text-white rounded-xl shadow-md shadow-secondary/20 hover:bg-[#0e5641] transition-all"
                  >
                    Join RozgarHub
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <IoLogOutOutline size={22} />
                  Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;