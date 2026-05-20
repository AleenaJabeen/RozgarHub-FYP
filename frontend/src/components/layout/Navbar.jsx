import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  IoMenu,
  IoClose,
  IoLogOutOutline,
  IoChevronDown,
  IoPersonOutline,
  IoGridOutline,
  IoChatbubblesOutline,
  IoMailOutline,
  IoNotificationsOutline,
} from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { Logo2 } from "../../assets";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/auth-slice";
import { useNavigate, Link } from "react-router-dom";
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
  const { user } = useSelector((state) => state.auth);

  const dropdownRef = useRef(null);
  const megaMenuRef = useRef(null);

  const unreadNotifications = true; 

  const role = user?.role || "pending";
  const name = user?.name || "User";
  const email = user?.email || "";
  const avatar = user?.avatar || "";
  const isOnline = user?.isOnline || false;
  const myId=user?._id;
  const { items: chats = [] } = useSelector(
  (state) => state.chats || {}
);
const hasUnreadMessages = chats.some((chat) => {
  const unreadCount = chat.unreadCounts?.[myId] || 0;
  return unreadCount > 0;
});

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
      { name: "Services", href: "/customer/services", isMega: true },
      { name: "Orders", href: "/customer/orders" },
      {
        name: "Messages",
        href: "/messages",
        icon: IoMailOutline,
        unread: hasUnreadMessages,
      },
      {
        name: "Notifications",
        href: "/notifications",
        icon: IoNotificationsOutline,
        unread: unreadNotifications,
      },
      { name: "Wishlist", href: "/", icon: IoMdHeartEmpty },
    ],
    serviceprovider: [
      { name: "Dashboard", href: "/serviceprovider" },
      { name: "Gigs", href: "/serviceprovider/gigs" },
      { name: "Orders", href: "/serviceprovider/orders" },
      {
        name: "Messages",
        href: "/messages",
        icon: IoMailOutline,
        unread: hasUnreadMessages,
      },
      {
        name: "Notifications",
        href: "/notifications",
        icon: IoNotificationsOutline,
        unread: unreadNotifications,
      },
      //  { name: "Inbox", href: "/messages"}
    ],
  };

  const currentLinks = navLinks[role] || navLinks.pending;

  const Avatar = ({ size = "sm" }) => {
    const sizeClass = size === "sm" ? "w-10 h-10" : "w-16 h-16";
    const textClass = size === "sm" ? "text-base" : "text-2xl";
    return (
      <div
        className={`${sizeClass} rounded-full border border-gray-300 overflow-hidden flex-shrink-0`}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-secondary font-bold ${textClass}`}
          >
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
            <h4 className="cursor-pointer relative pb-2 font-bold text-tertiary text-sm uppercase tracking-wider inline-block w-full">
              {cat.name}
              <span className="absolute rounded-full bottom-0 left-0 w-0 h-[3px] bg-secondary transition-all duration-500 ease-in-out group-hover/cat:w-[70%]" />
              <span className="absolute rounded-full bottom-0 left-0 w-[70%] h-[1px] bg-gray-100 -z-10" />
            </h4>
            <ul className="space-y-2 mt-3">
              {cat.subcategories.map((sub) => (
                <li key={sub}>
                  <Link
                    to={`/`}
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
    <nav className="bg-primary shadow-md border-b border-gray-100 sticky max-h-[77px] top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex-shrink-0">
            <img src={Logo2} alt="RozgarHub" className="h-12 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {currentLinks.map((link) =>
              link.isMega ? (
                <div
                  key={link.name}
                  className="relative h-20 flex items-center"
                  ref={megaMenuRef}
                  onMouseEnter={() => setDesktopMegaOpen(true)}
                  onMouseLeave={() => setDesktopMegaOpen(false)}
                >
                  <Link
                    to={link.href}
                    onClick={() => setDesktopMegaOpen(false)}
                    className={`flex cursor-pointer  items-center text-gray-600 hover:text-secondary font-semibold transition-colors ${desktopMegaOpen ? "text-secondary" : ""}`}
                  >
                    {link.name}
                  </Link>

                  {desktopMegaOpen && (
                    <div
                      className="absolute top-[90%] lg:right-[-9rem] md:right-[-7rem] w-[75vw] bg-white shadow-2xl border border-gray-300 p-8 animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl"
                      style={{ zIndex: 100 }}
                    >
                      <MegaMenuContent
                        onLinkClick={() => setDesktopMegaOpen(false)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative flex items-center ${
                    link.icon ? "justify-center" : ""
                  } text-gray-600 hover:text-secondary font-semibold`}
                >
                  {link.icon ? (
                    <>
                      <link.icon className="text-2xl" title={link.name} />

                      {link.unread && (
                        <span className="absolute -top-1 right-0 w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      )}
                    </>
                  ) : (
                    <span>{link.name}</span>
                  )}
                </Link>
              ),
            )}

            {role === "pending" ? (
              <div className="cursor-pointer flex items-center space-x-4">
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
              <div className="cursor-pointer relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="relative cursor-pointer flex items-center focus:outline-none"
                >
                  <Avatar size="sm" />
                  <div
                    className={`w-2 h-2 absolute bottom-1 right-0 ${isOnline ? "bg-green-500" : "bg-red-500 "} rounded-full`}
                  ></div>
                </button>

                {dropdownOpen && (
                  <div
                    onClick={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-3 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 px-4 animate-in fade-in zoom-in duration-200 min-w-[200px]"
                  >
                    <div className="flex items-center gap-3 border-b p-2 border-gray-300">
                      <Avatar size="sm" />
                      <div>
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {capitalizeWords(name)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {email}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={role === "serviceprovider" ? "/serviceprovider" : ""}
                      className={`${role === "customer" ? "hidden" : "flex"}  gap-2 cursor-pointer items-center px-2 py-4 text-base text-gray-600 hover:bg-gray-50`}
                    >
                      <IoGridOutline className="text-lg" />
                      Dashboard
                    </Link>
                    <Link
                      to={
                        role === "serviceprovider"
                          ? "/serviceprovider/view-profile"
                          : "/customer/view-profile"
                      }
                      className="flex items-center gap-2 cursor-pointer px-2 py-2.5 text-base text-gray-600 hover:bg-gray-50"
                    >
                      <IoPersonOutline className="text-lg" />
                      Profile Settings
                    </Link>
                    <Link
                      to="/messages"
                      className="flex items-center gap-2 cursor-pointer px-2 py-2.5 text-base text-gray-600 hover:bg-gray-50"
                    >
                      <IoChatbubblesOutline className="text-lg" />
                      Messages
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full cursor-pointer flex items-center justify-center  border-t border-gray-300 px-4 py-3 text-base text-red-600"
                    >
                      <IoLogOutOutline className="me-2 text-lg" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden text-secondary"
          >
            {mobileOpen ? <IoClose size={30} /> : <IoMenu size={30} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white fixed inset-0 top-20 z-50 overflow-y-auto">
          {role !== "pending" && (
            <div className="px-6 py-8 bg-gray-50 border-b border-gray-100 flex items-center space-x-4">
              <Avatar size="lg" />
              <div>
                <h3 className="font-bold text-xl text-gray-800">
                  {capitalizeWords(name)}
                </h3>
                <p className="text-sm text-gray-500">{email}</p>
              </div>
            </div>
          )}

          <div className="px-4 py-6 space-y-2">
            {currentLinks.map((link) => (
              <React.Fragment key={link.name}>
                {link.isMega ? (
                  <div className="w-full">
                    <div
                      className={`flex justify-between items-center w-full px-4 py-4 text-base font-semibold rounded-xl transition-colors ${
                        mobileMegaOpen
                          ? "bg-secondary/10 text-secondary"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Link
                        to={link.href}
                        onClick={closeMobileMenu}
                        className="flex-grow py-2"
                      >
                        {link.name}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileMegaOpen((prev) => !prev);
                        }}
                        className="p-2"
                      >
                        <IoChevronDown
                          className={`transition-transform duration-300 ${mobileMegaOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>

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
                to="/profile"
                onClick={closeMobileMenu}
                className="block px-4 py-4 text-base text-gray-600 font-semibold hover:bg-secondary/10 rounded-xl"
              >
                Profile Settings
              </Link>
            )}

            <div className="pt-3 border-t border-gray-300">
              {role === "pending" ? (
                <div className="space-y-4">
                  <Link
                    to="/auth?mode=login"
                    onClick={closeMobileMenu}
                    className="block text-center w-full py-4 font-medium text-gray-600 border-2 border-gray-200 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={closeMobileMenu}
                    className="block text-center w-full py-4 font-medium bg-secondary text-white rounded-xl shadow-lg"
                  >
                    Join RozgarHub
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-4 text-base text-gray-600 font-semibold hover:bg-red-50 rounded-xl"
                >
                  Log Out <IoLogOutOutline size={24} />
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
