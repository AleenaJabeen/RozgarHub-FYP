import React, { useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { Logo2 } from "../../assets";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/auth-slice";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import { showToast } from "../../utils/toastHelper";

const Navbar = () => {
  // Removed onOpenAuth prop
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Neutralize role to 'pending' if no user exists
  const role = user?.role || "pending";
  const name = user?.name || "U";

  const handleLogout = async () => {
    try {
      const data = await dispatch(logoutUser()).unwrap();
      showToast(data.message || "Logged out successfully");
      navigate("/");
    } catch (error) {
      showToast(error, "error");
    }
  };

  const navLinks = {
    pending: [
      { name: "Services", href: "#" },
      { name: "Sign in", href: "/auth?mode=login" },
    ],
    customer: [
      { name: "Services", href: "#" },
      { name: "Orders", href: "#" },
      { name: "Inbox", href: "#" },
      { name: "Log out", onClick: handleLogout },
    ],
    serviceprovider: [
      { name: "Home", href: "/serviceprovider" },
      { name: "Gigs", href: "#" },
      { name: "Orders", href: "#" },
      { name: "Log out", onClick: handleLogout },
    ],
  };

  const currentLinks = navLinks[role] || navLinks.pending;

  return (
    <nav className="bg-primary shadow-xl border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img src={Logo2} alt="RozgarHub" className="h-12 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {currentLinks.map((link) =>
              link.onClick ? (
                <button
                  key={link.name}
                  onClick={link.onClick}
                  className="text-gray-800 hover:text-secondary font-medium transition-colors"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-800 hover:text-secondary font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ),
            )}

            {role === "pending" ? (
              <Link
                to="/auth?mode=signup"
                className="border-2 border-secondary text-secondary px-6 py-2 rounded-lg font-semibold 
             transition-all duration-300 ease-in-out
             hover:bg-secondary hover:text-white hover:shadow-lg
             active:scale-95"
              >
                Join now
              </Link>
            ) : (
              <div className="flex items-center space-x-2 cursor-pointer border-l pl-8 group">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary font-bold group-hover:bg-secondary transition-colors">
                  {name[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {role}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary p-2"
            >
              {isOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4 shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {currentLinks.map((link) =>
              link.onClick ? (
                <button
                  key={link.name}
                  onClick={() => {
                    link.onClick();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-4 text-base font-medium text-gray-700 hover:bg-secondary rounded-md"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-left px-3 py-4 text-base font-medium text-gray-700 hover:bg-secondary rounded-md"
                >
                  {link.name}
                </Link>
              ),
            )}
            <div className="pt-4">
              {role === "pending" ? (
                <Link
                  to="/auth?mode=sign-up"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full bg-secondary text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Join now
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full bg-secondary text-white px-6 py-3 rounded-lg font-semibold"
                >
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
