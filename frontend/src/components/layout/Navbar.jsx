import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  IoMenu, IoClose, IoLogOutOutline, IoChevronDown, IoPersonOutline 
} from "react-icons/io5";
import { Logo2 } from "../../assets";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/auth-slice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { showToast } from "../../utils/toastHelper";
import { capitalizeWords } from "../../utils/capitalize";
import { CATEGORIES as categories } from "../../utils/categories";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMegaOpen, setMobileMegaOpen] = useState(false);
  const [desktopMegaOpen, setDesktopMegaOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const dropdownRef = useRef(null);
  const megaMenuRef = useRef(null);

  const role = user?.role || "pending";
  const name = user?.name || "User";
  const email = user?.email || "";
  const avatar = user?.avatar || "";

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
        setMobileMegaOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setDesktopMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setDesktopMegaOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const data = await dispatch(logoutUser()).unwrap();
      showToast(data.message || "Logged out successfully");
      setDropdownOpen(false);
      setMobileOpen(false);
      navigate("/");
    } catch (error) {
      showToast(error, "error");
    }
  };

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    setMobileMegaOpen(false);
  }, []);

  const navLinks = {
    pending: [{ name: "Services", href: "/services", isMega: true }],
    customer: [
      { name: "Home", href: "/customer" },
      { name: "Services", href: "/services", isMega: true },
      { name: "Orders", href: "/orders" },
      { name: "Inbox", href: "/inbox" },
    ],
    serviceprovider: [
      { name: 'Home', href: '/serviceprovider' },
      { name: 'Gigs', href: '/serviceprovider/gigs' },
      { name: 'Orders', href: '/serviceprovider/orders' },
    ]
  };

  const currentLinks = navLinks[role] || navLinks.pending;

  const Avatar = ({ size = "sm" }) => {
    const sizeClass = size === "sm" ? "w-10 h-10" : "w-14 h-14";
    const textClass = size === "sm" ? "text-base" : "text-xl";
    return (
      <div className={`${sizeClass} rounded-full border-2 border-gray-200 overflow-hidden flex-shrink-0 bg-white`}>
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-secondary font-bold ${textClass} bg-secondary/10`}>
            {name[0]?.toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  const MegaMenuContent = ({ onLinkClick }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {categories.map((cat) => (
        <div key={cat.name} className="space-y-3">
          <div className="group/cat mb-4">
            <h4 className="relative pb-2 font-bold text-tertiary text-sm uppercase tracking-wider inline-block w-full">
              {cat.name}
              <span className="absolute rounded-full bottom-0 left-0 w-0 h-[3px] bg-secondary transition-all duration-500 ease-in-out group-hover/cat:w-[70%]" />
              <span className="absolute rounded-full bottom-0 left-0 w-[70%] h-[1px] bg-gray-100 -z-10" />
            </h4>
            <ul className="space-y-2 mt-3">
              {cat.subcategories.map((sub) => (
                <li key={sub}>
                  <Link
                    to={`/services/${sub.toLowerCase().replace(/ /g, "-")}`}
                    onClick={onLinkClick}
                    className="text-sm text-gray-500 hover:text-secondary hover:translate-x-1 hover:font-bold transition-all inline-block"
                  >
                    {sub}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );

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
              {currentLinks.map((link) =>
                link.isMega ? (
                  <div
                    key={link.name}
                    className="relative h-20 flex items-center"
                    ref={megaMenuRef}
                    onMouseEnter={() => setDesktopMegaOpen(true)}
                    onMouseLeave={() => setDesktopMegaOpen(false)}
                  >
                    <button
                      onClick={() => setDesktopMegaOpen((prev) => !prev)}
                      className={`flex items-center text-gray-600 hover:text-secondary font-semibold transition-colors ${desktopMegaOpen ? "text-secondary" : ""}`}
                    >
                      {link.name}
                    </button>

                    {desktopMegaOpen && (
                      <div
                        className="absolute top-[90%] left-1/2 -translate-x-1/2 w-[75vw] max-w-5xl bg-white shadow-2xl rounded-2xl border border-gray-100 p-8 animate-in fade-in slide-in-from-top-2 duration-300"
                        style={{ zIndex: 100 }}
                      >
                        <MegaMenuContent onLinkClick={() => setDesktopMegaOpen(false)} />
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="relative group text-gray-600 font-semibold transition-colors py-2 h-20 flex items-center"
                  >
                    <span className="group-hover:text-secondary transition-colors duration-300">
                      {link.name}
                    </span>
                    <span className="absolute left-0 bottom-6 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                )
              )}
            </div>

            {/* Desktop Auth/Profile Actions */}
            {role === "pending" ? (
              <div className="flex items-center space-x-5 ml-4 border-l border-gray-200 pl-8">
                <Link to="/auth?mode=login" className="text-gray-600 font-semibold hover:text-secondary transition-colors">
                  Sign In
                </Link>
                <Link to="/auth?mode=signup" className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold shadow-md shadow-secondary/20 hover:bg-[#0e5641] hover:-translate-y-0.5 transition-all duration-300">
                  Join Now
                </Link>
              </div>
            ) : (
              <div className="relative ml-4 border-l border-gray-200 pl-8" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center focus:outline-none group"
                >
                  <div className={`rounded-full transition-all duration-300 ${dropdownOpen ? 'ring-2 ring-secondary ring-offset-2' : 'group-hover:ring-2 group-hover:ring-secondary/50 group-hover:ring-offset-2'}`}>
                    <Avatar size="sm" />
                  </div>
                </button>

                {/* Desktop Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-4 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center p-4 bg-gray-50/50 border-b border-gray-100">
                      <Avatar size="sm" />
                      <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">{capitalizeWords(name)}</p>
                        <p className="text-xs text-gray-500 truncate">{email}</p>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to={role === "serviceprovider" ? "/serviceprovider/view-profile" : "/customer/view-profile"}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-secondary/5 hover:text-secondary transition-colors"
                      >
                        <IoPersonOutline className="text-lg" />
                        Profile Settings
                      </Link>
                    </div>

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
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-600 hover:text-secondary transition-colors p-2 focus:outline-none"
            >
              {mobileOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white fixed inset-x-0 top-20 bottom-0 z-50 overflow-y-auto border-t border-gray-100 animate-in slide-in-from-right-full duration-300">
          
          {role !== "pending" && (
            <div className="px-6 py-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 flex items-center space-x-4">
              <Avatar size="lg" />
              <div className="overflow-hidden">
                <h3 className="font-bold text-lg text-gray-800 truncate">{capitalizeWords(name)}</h3>
                <p className="text-sm text-gray-500 truncate">{email}</p>
              </div>
            </div>
          )}

          <div className="px-4 py-4 space-y-1">
            {currentLinks.map((link) => (
              <React.Fragment key={link.name}>
                {link.isMega ? (
                  <div className="w-full">
                    <button
                      onClick={() => setMobileMegaOpen((prev) => !prev)}
                      className={`flex justify-between items-center w-full px-4 py-4 text-base font-semibold rounded-xl transition-colors ${mobileMegaOpen ? "bg-secondary/10 text-secondary" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {link.name}
                      <IoChevronDown className={`transition-transform duration-300 ${mobileMegaOpen ? "rotate-180" : ""}`} />
                    </button>

                    {mobileMegaOpen && (
                      <div className="pl-6 bg-gray-50 rounded-xl mt-2 py-4 animate-in slide-in-from-top-1">
                        {categories.map((cat) => (
                          <div key={cat.name} className="py-2 px-2">
                            <p className="font-bold text-xs text-tertiary uppercase tracking-widest mb-2">
                              {cat.name}
                            </p>
                            <div className="flex flex-col space-y-1">
                              {cat.subcategories.map((sub) => (
                                <Link
                                  key={sub}
                                  to={`/services/${sub.toLowerCase().replace(/ /g, "-")}`}
                                  onClick={closeMobileMenu}
                                  className="block py-2 text-gray-500 text-sm active:text-secondary"
                                >
                                  {sub}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={link.href}
                    onClick={closeMobileMenu}
                    className="block px-4 py-4 text-base text-gray-600 font-semibold hover:bg-secondary/10 rounded-xl"
                  >
                    {link.name}
                  </Link>
                )}
              </React.Fragment>
            ))}

            {role !== "pending" && (
              <Link
                to={role === "serviceprovider" ? "/serviceprovider/view-profile" : "/customer/view-profile"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-4 text-base font-semibold text-gray-700 hover:bg-secondary/10 hover:text-secondary rounded-xl transition-colors mt-2"
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
                    onClick={closeMobileMenu}
                    className="block text-center w-full py-3.5 font-bold text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={closeMobileMenu}
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