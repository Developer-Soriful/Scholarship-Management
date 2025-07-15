import React from 'react';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 ">
      <div className=" px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center md:items-start">
          <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight mb-1">Scholar<span className="text-black">Hub</span></Link>
          <span className="text-sm text-black">Empowering Education, Enabling Dreams</span>
        </div>
        {/* Links */}
        <div className="flex space-x-6">
          <Link to="/" className="text-black hover:text-blue-600 transition">Home</Link>
          <Link to="/allScholarship" className="text-black hover:text-blue-600 transition">All Scholarship</Link>
        </div>
        {/* Copyright */}
        <div className="text-sm text-black text-center md:text-right">
          &copy; {new Date().getFullYear()} ScholarHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
// added