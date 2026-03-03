import React from 'react';
import { FaFacebook,FaLinkedin,FaYoutube,FaInstagram } from "react-icons/fa";
import {Logo} from '../../assets'


const Footer = () => {
  const footerSections = [
    {
      title: 'Company',
      links: ['About us', 'Careers', 'Blogs', 'Press']
    },
    {
      title: 'Popular Services',
      links: ['Plumbing', 'Home Repair', 'Electrical', 'Assembly']
    },
    {
      title: 'Support & Legal',
      links: ['Help Centre', 'Contact Us', 'Terms of Service', 'Privacy Policy']
    }
  ];

  return (
    <footer className="bg-secondary text-primary pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Logo and Socials */}
          <div className="space-y-6">
            <img 
              src={Logo}
              alt="RozgarHub" 
              className="h-14 w-auto"
            />
            <div>
              <p className="font-semibold mb-4 text-lg">Follow us!</p>
              <div className="flex space-x-5">
                <FaFacebook className="cursor-pointer hover:text-emerald-200 transition-colors" />
                <FaLinkedin className="cursor-pointer hover:text-emerald-200 transition-colors" />
                <FaYoutube className="cursor-pointer hover:text-emerald-200 transition-colors" />
                <FaInstagram className="cursor-pointer hover:text-emerald-200 transition-colors" />
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xl font-bold mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-emerald-50 hover:text-white transition-colors block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-emerald-800 text-center text-emerald-200 text-sm">
          © {new Date().getFullYear()} RozgarHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;