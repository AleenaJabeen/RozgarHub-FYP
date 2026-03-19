import React, { useState, useRef, useEffect } from "react";
import {
  IoMenu,
  IoClose,
  IoLogOutOutline,
} from "react-icons/io5";
import { Logo2 } from "../../assets";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/auth-slice";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../utils/toastHelper";
import { capitalizeWords } from '../../utils/capitalize';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      { name: 'Dashboard', href: '/serviceprovider' },
      { name: 'Gigs', href: '/serviceprovider/gigs' },
      { name: 'Orders', href: '/serviceprovider/orders' },
    ]
    
  
  };

  const currentLinks = navLinks[role] || navLinks.pending;

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex-shrink-0">
            <img src={Logo2} alt="RozgarHub" className="h-10 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {currentLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-600 cursor-pointer hover:text-secondary font-semibold transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {role === "pending" ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth?mode=login"
                  className="text-gray-600 font-semibold hover:text-secondary"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  Join Now
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 group focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary font-bold">
                        {name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
          
                </button>

                {/* Desktop Dropdown */}
                {isDropdownOpen && (
                  <div     onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="absolute right-0 mt-3  bg-white rounded-xl shadow-2xl border border-gray-100 py-2 px-4 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center border-b p-2 border-gray-300 ">
                        <div className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary font-bold">
                        {name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                      
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {capitalizeWords(name)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>
                    </div>
                    <Link

                      to={
                        role === "serviceprovider"
                          ? "/serviceprovider"
                          : "/customer"
                      }
                      className="flex cursor-pointer items-center px-4 py-4 text-base text-gray-600 hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                    <Link
                 
                      to={role === "serviceprovider" ? "/serviceprovider/view-profile" : "/customer/view-profile"}
                      className="flex items-center cursor-pointer px-4 py-2.5 text-base text-gray-600 hover:bg-gray-50"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex cursor-pointer items-center border-t border-gray-300 px-4 py-3 text-base text-gray-600  "
                    >
                      Log Out  <IoLogOutOutline className="ms-2 text-lg" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary"
            >
              {isOpen ? <IoClose size={30} /> : <IoMenu size={30} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Container */}
      {isOpen && (
        <div className="md:hidden bg-white fixed inset-0 top-20 z-50 overflow-y-auto">
          {role !== "pending" && (
            <div className="px-6 py-8 bg-gray-50 border-b border-gray-100 flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-2 border-secondary overflow-hidden">
                {avatar ? (
                  <img src={avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-secondary/20 h-full w-full flex items-center justify-center text-secondary text-2xl font-bold">
                    {name[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">{capitalizeWords(name)}</h3>
                <p className="text-sm text-gray-500">{email}</p>
              </div>
            </div>
          )}

          <div className="px-4 py-6 space-y-2">
            {currentLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 cursor-pointer py-4 text-base text-gray-600 hover:bg-secondary/10 rounded-xl"
              >
                {link.name}
              </Link>
            ))}

            {role !== "pending" && (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-4 text-base text-gray-600 hover:bg-secondary/10 rounded-xl"
              >
                Profile Settings
              </Link>
            )}

            <div className="pt-3 border-t border-gray-300">
              {role === "pending" ? (
                <div className="space-y-4">
                  <Link
                    to="/auth?mode=login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center w-full py-4 font-medium text-gray-600 border-2 border-gray-200 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setIsOpen(false)}
                    className="block text-center w-full py-4 font-medium bg-secondary text-white rounded-xl shadow-lg"
                  >
                    Join RozgarHub
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex gap-2 p-4 text-base text-gray-600 "
                >
                  Log Out  <IoLogOutOutline size={24} />
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
