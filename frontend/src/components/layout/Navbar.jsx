import React, { useState } from 'react';
import { IoMenu, IoClose } from "react-icons/io5";
import { Logo2 } from '../../assets';
import { useDispatch, useSelector } from 'react-redux'; 
import { logoutUser } from '../../store/auth-slice'; 
import { useNavigate } from 'react-router-dom'; 
import { showToast } from '../../utils/toastHelper'; 

const Navbar = ({ onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch(); 
  const navigate = useNavigate(); 
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;
  const name=user?.name || "U";

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
      { name: 'Services', href: '#' },
      { name: 'Sign up/Log in', onClick: onOpenAuth },
    ],
    customer: [
      { name: 'Services', href: '#' },
      { name: 'Orders', href: '#' },
      { name: 'Inbox', href: '#' },
      { name: 'Log out', onClick: handleLogout }, // ✅
    ],
    serviceprovider: [
      { name: 'Home', href: '#' },
      { name: 'Gigs', href: '#' },
      { name: 'Orders', href: '#' },
      { name: 'Log out', onClick: handleLogout }, // ✅
    ]
  };

  const currentLinks = navLinks[role] || navLinks.pending;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <img src={Logo2} alt="RozgarHub" className="h-12 w-auto" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {currentLinks.map((link) => (
              <button
                key={link.name}
                onClick={link.onClick ? link.onClick : () => window.location.href = link.href}
                className="text-gray-800 hover:text-emerald-700 font-medium transition-colors"
              >
                {link.name}
              </button>
            ))}

            {role === 'pending' || !role? (
              <button
                onClick={onOpenAuth}
                className="border-2 border-emerald-600 text-emerald-700 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-all"
              >
                Join now
              </button>
            ) : (
              <div className="flex items-center space-x-2 cursor-pointer border-l pl-8 group">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold group-hover:bg-emerald-200 transition-colors">
                  {name[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-600">{role}</span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-emerald-800 p-2">
              {isOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4 shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {currentLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => { if (link.onClick) link.onClick(); setIsOpen(false); }}
                className="block w-full text-left px-3 py-4 text-base font-medium text-gray-700 hover:bg-emerald-50 rounded-md"
              >
                {link.name}
              </button>
            ))}
            <div className="pt-4">
              <button
                onClick={() => { role === 'pending' ? onOpenAuth() : handleLogout(); setIsOpen(false); }}
                className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {role === 'pending' ? 'Join now' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;