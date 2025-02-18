import React, { useState } from "react";

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-xl md:text-2xl font-bold tracking-tight hover:text-blue-200 transition-colors">
        Shift Scheduler
      </h1>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      </button>

      {/* Menu Items */}
      <div className={`md:flex items-center space-x-6 ${isMenuOpen ? "block" : "hidden"} absolute md:relative top-16 md:top-0 left-0 w-full md:w-auto bg-blue-500 md:bg-transparent p-4 md:p-0 rounded-md md:rounded-none shadow-md md:shadow-none`}>
        <span className="block md:inline text-sm md:text-lg font-medium text-blue-200 mb-2 md:mb-0">
          {user?.name}
        </span>
        <button
          onClick={onLogout}
          className="bg-gray-700 text-white text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium 
                     hover:bg-gray-600 active:bg-gray-800 
                     transform hover:scale-105 
                     transition-all duration-200 
                     shadow-sm hover:shadow-md"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
