import { Link, useLocation } from 'react-router';
import useAuth from '../Auth/useAuth';
import useUserRole from '../Auth/useUserRole';
import { FaGraduationCap, FaHome, FaUserCircle, FaBars, FaTimes, FaSignInAlt } from 'react-icons/fa';
import { MdAdminPanelSettings, MdSpaceDashboard, MdDashboard } from 'react-icons/md';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Unified menu toggle handler for better reusability
  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Navigation Links Data - Centralized for reusability
  const navLinks = [
    {
      to: '/',
      label: 'Home',
      icon: FaHome,
      show: true,
    },
    {
      to: '/allScholarship',
      label: 'All Scholarships',
      icon: FaGraduationCap,
      show: true,
    },
    {
      to: '/userDashboard',
      label: 'Dashboard',
      icon: MdSpaceDashboard,
      show: user && role === 'user',
    },
    {
      to: '/admindashboard',
      label: 'Admin Panel',
      icon: MdAdminPanelSettings,
      show: user && role === 'admin',
    },
    {
      to: '/moderatorDashboard',
      label: 'Moderator Panel',
      icon: MdDashboard,
      show: user && role === 'moderator',
    },
  ];

  // Profile link based on user role
  const profileLink = user ?
    (role === 'user' ? "/userDashboard/myProfile" :
      role === 'admin' ? "/admindashboard/adminprofile" :
      "/moderatorDashboard/moderatorprofile") :
    '/signin';

  // Helper function for rendering links
  const renderLink = (link, isMobile = false) => {
    const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
    const activeStyles = isActive
      ? 'text-blue-600 font-semibold bg-blue-50 border-l-4 border-blue-600'
      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50';
    
    return (
      link.show && (
        <Link
          key={link.to}
          to={link.to}
          onClick={isMobile ? handleMenuToggle : undefined}
          className={`flex items-center px-4 py-2 rounded-lg text-sm transition-all duration-200 ${activeStyles}`}
        >
          <link.icon className={`mr-2 ${isMobile ? 'text-lg' : 'text-base'}`} />
          <span>{link.label}</span>
        </Link>
      )
    );
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                Scholar<span className="text-blue-600">Hub</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map(link => renderLink(link))}
            
            {/* Login/Profile Link */}
            {!user ? (
              <Link
                to="/signin"
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <FaSignInAlt className="mr-2 text-sm" />
                Login
              </Link>
            ) : (
              <Link 
                to={profileLink}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="relative">
                  <img 
                    className="w-9 h-9 rounded-full border-2 border-gray-200 group-hover:border-blue-500 transition-all duration-200" 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden xl:block">
                  <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button 
              onClick={handleMenuToggle}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleMenuToggle}
        ></div>
        
        {/* Menu Panel */}
        <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="text-white text-sm" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Scholar<span className="text-blue-600">Hub</span>
              </span>
            </div>
            <button 
              onClick={handleMenuToggle}
              className="p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <FaTimes className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* User Profile Section */}
          {user && (
            <Link
              to={profileLink}
              onClick={handleMenuToggle}
              className="block p-4 border-b border-gray-200 bg-gray-50 transition-colors duration-200 hover:bg-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-600 capitalize">{role}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Navigation Links */}
          <div className="p-4 space-y-1 bg-white">
            {navLinks.map(link => renderLink(link, true))}
            
            {/* Login Link */}
            {!user && (
              <Link
                to="/signin"
                onClick={handleMenuToggle}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <FaSignInAlt className="mr-3 text-sm" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;