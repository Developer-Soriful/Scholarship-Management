
import { Link, useLocation } from 'react-router';
import useAuth from '../Auth/useAuth';
import useUserRole from '../Auth/useUserRole';
import { FaUser, FaHome, FaGraduationCap, FaTachometerAlt, FaSignInAlt, FaUserCircle, FaTimes } from 'react-icons/fa';
import { MdDashboard, MdAdminPanelSettings, MdSpaceDashboard } from 'react-icons/md';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user } = useAuth()
  const { role } = useUserRole()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Function to check if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Function to get active link styles
  const getActiveStyles = (path) => {
    return isActive(path) 
      ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
  }

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])
// hello 
  return (
    <nav>
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

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-1">
            
            {/* Home Link */}
            <Link
              to="/"
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getActiveStyles('/')}`}
            >
              <FaHome className="mr-2 text-sm" />
              Home
            </Link>

            {/* All Scholarship Link */}
            <Link
              to="/allScholarship"
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getActiveStyles('/allScholarship')}`}
            >
              <FaGraduationCap className="mr-2 text-sm" />
              All Scholarships
            </Link>

            {/* User Dashboard Link */}
            {user && role === "user" && (
              <Link
                to="/userDashboard"
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getActiveStyles('/userDashboard')}`}
              >
                <MdSpaceDashboard className="mr-2 text-sm" />
                Dashboard
              </Link>
            )}

            {/* Admin Dashboard Link */}
            {user && role === "admin" && (
              <Link
                to="/admindashboard"
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getActiveStyles('/admindashboard')}`}
              >
                <MdAdminPanelSettings className="mr-2 text-sm" />
                Admin Panel
              </Link>
            )}

            {/* Moderator Dashboard Link */}
            {user && role === "moderator" && (
              <Link
                to="/moderatorDashboard"
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getActiveStyles('/moderatorDashboard')}`}
              >
                <MdDashboard className="mr-2 text-sm" />
                Moderator Panel
              </Link>
            )}

            {/* Login Link */}
            {!user && (
              <Link
                to="/signin"
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <FaSignInAlt className="mr-2 text-sm" />
                Login
              </Link>
            )}

            {/* User Profile */}
            {user && (
              <div className="ml-4">
                <Link 
                  to={
                    role === 'user' ? "/userDashboard/myProfile" :
                    role === 'admin' ? "/admindashboard/adminprofile" :
                    "/moderatorDashboard/moderatorprofile"
                  }
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="relative">
                    <img 
                      className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-blue-500 transition-all duration-200" 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{role}</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute inset-0 transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1'}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16" />
                  </svg>
                </span>
                <span className={`absolute inset-0 transform transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
                  </svg>
                </span>
                <span className={`absolute inset-0 transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1'}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18h16" />
                  </svg>
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
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
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <FaTimes className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* User Profile Section - Simplified */}
            {user && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-600 capitalize">{role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="p-4 space-y-1 bg-white">
              
              {/* Home Link */}
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${getActiveStyles('/')}`}
              >
                <FaHome className="mr-3 text-sm" />
                Home
              </Link>

              {/* All Scholarship Link */}
              <Link
                to="/allScholarship"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${getActiveStyles('/allScholarship')}`}
              >
                <FaGraduationCap className="mr-3 text-sm" />
                All Scholarships
              </Link>

              {/* User Dashboard Link */}
              {user && role === "user" && (
                <Link
                  to="/userDashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${getActiveStyles('/userDashboard')}`}
                >
                  <MdSpaceDashboard className="mr-3 text-sm" />
                  Dashboard
                </Link>
              )}

              {/* Admin Dashboard Link */}
              {user && role === "admin" && (
                <Link
                  to="/admindashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${getActiveStyles('/admindashboard')}`}
                >
                  <MdAdminPanelSettings className="mr-3 text-sm" />
                  Admin Panel
                </Link>
              )}

              {/* Moderator Dashboard Link */}
              {user && role === "moderator" && (
                <Link
                  to="/moderatorDashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${getActiveStyles('/moderatorDashboard')}`}
                >
                  <MdDashboard className="mr-3 text-sm" />
                  Moderator Panel
                </Link>
              )}

              {/* Login Link */}
              {!user && (
                <Link
                  to="/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  <FaSignInAlt className="mr-3 text-sm" />
                  Login
                </Link>
              )}

              {/* User Profile Link */}
              {user && (
                <Link
                  to={
                    role === 'user' ? "/userDashboard/myProfile" :
                    role === 'admin' ? "/admindashboard/adminprofile" :
                    "/moderatorDashboard/moderatorprofile"
                  }
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  <FaUserCircle className="mr-3 text-sm" />
                  Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
