import React from 'react';
import { 
  FaFacebook, 
  FaLinkedin, 
  FaInstagram, 
  FaTiktok, 
  FaPinterest, 
  FaGlobe 
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"; // For the modern X logo
import { Logo } from '../../assets';

const Footer = () => {
  const footerSections = [
    {
      title: 'For Customers',
      links: ['How to hire', 'Talent Marketplace', 'Hire nearby']
    },
    {
      title: 'For Service Providers',
      links: ['How to find work',  'Find local jobs nearby','Gig Making']
    },
    {
      title: 'Popular Categories',
      links: ['Plumber', 'Electrician', 'Car Maintenance']
    },
    {
      title: 'About',
      links: ['Policy',  'Contact us',  'Trust, safety & security']
    }
  ];

  return (
    <footer className="w-full bg-secondary text-primary pt-16 pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Four Columns (Upwork Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-base font-semibold mb-5  cursor-pointer">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-[14px] text-white hover:text-white hover:underline transition-all"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar (Fiverr Style) */}
        <div className="pt-8 border-t border-gray-500 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          
          {/* Logo and Copyright */}
          <div className="flex flex-col md:flex-row items-center md:space-x-4">
            <img 
              src={Logo}
              alt="RozgarHub" 
              className="h-16 w-auto mb-4 md:mb-0 grayscale brightness-200" 
            />
            <p className="text-gray-200 text-[14px]">
            &copy; {new Date().getFullYear()} RozgarHub 
            </p>
          </div>

          {/* Socials and Language */}
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex space-x-5 text-gray-100 text-xl">
              <FaInstagram className="hover:text-gray-300 cursor-pointer" />
              <FaLinkedin className="hover:text-gray-300 cursor-pointer" />
              <FaFacebook className="hover:text-gray-300 cursor-pointer" />
              <FaXTwitter className="hover:text-gray-300 cursor-pointer" />
            </div>

            {/* Language Picker Mockup */}
            <div className="flex items-center space-x-2 text-gray-200 font-medium hover:text-gray-300 cursor-pointer">
              <FaGlobe />
              <span className="text-[14px]">English</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;