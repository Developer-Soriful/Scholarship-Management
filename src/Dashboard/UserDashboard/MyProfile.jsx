import React, { useState } from 'react'
import useAuth from '../../Auth/useAuth'
import useUserRole from '../../Auth/useUserRole'
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../Components/LoadingSpinner';
import { 
  ArrowLeftOnRectangleIcon, 
  ArrowLeftIcon, 
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const MyProfile = () => {
  const { user, logoutUser } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Try to get join date from user metadata if available
  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : null;

  if (!user || roleLoading) {
    return <div className="flex justify-center items-center min-h-[70vh]"><LoadingSpinner /></div>;
  }

  const handleLogout = async () => {
    setLoading(true);
    setMessage("");
    try {
      await logoutUser();
      Swal.fire({
        icon: 'success',
        title: 'Logged out successfully!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setMessage("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-4 md:py-6 px-2 w-full h-[75vh] overflow-hidden">
      {/* Animated SVG background shapes */}
      <svg className="absolute left-0 top-0 w-32 h-32 md:w-48 md:h-48 opacity-10 animate-pulse pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#3b82f6" d="M44.8,-67.2C56.6,-59.7,62.7,-42.2,68.2,-25.6C73.7,-9,78.6,6.7,74.2,20.2C69.8,33.7,56.1,45,41.2,54.2C26.3,63.4,10.1,70.5,-7.2,74.2C-24.5,77.9,-42.9,78.2,-54.7,68.2C-66.5,58.2,-71.7,37.9,-72.2,19.1C-72.7,0.3,-68.5,-16.9,-60.2,-30.7C-51.9,-44.5,-39.5,-54.9,-25.6,-61.7C-11.7,-68.5,4.7,-71.7,20.7,-70.1C36.7,-68.5,52.9,-62.7,44.8,-67.2Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute right-0 bottom-0 w-24 h-24 md:w-32 md:h-32 opacity-10 animate-pulse pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#6366f1" d="M44.8,-67.2C56.6,-59.7,62.7,-42.2,68.2,-25.6C73.7,-9,78.6,6.7,74.2,20.2C69.8,33.7,56.1,45,41.2,54.2C26.3,63.4,10.1,70.5,-7.2,74.2C-24.5,77.9,-42.9,78.2,-54.7,68.2C-66.5,58.2,-71.7,37.9,-72.2,19.1C-72.7,0.3,-68.5,-16.9,-60.2,-30.7C-51.9,-44.5,-39.5,-54.9,-25.6,-61.7C-11.7,-68.5,4.7,-71.7,20.7,-70.1C36.7,-68.5,52.9,-62.7,44.8,-67.2Z" transform="translate(100 100)" />
      </svg>
      
      <div className="relative bg-white shadow-2xl rounded-2xl p-4 md:p-6 w-full max-w-4xl flex flex-col md:flex-row border border-blue-100 hover:shadow-[0_8px_40px_0_rgba(59,130,246,0.15)] transition-all duration-300 h-full overflow-y-auto">
        {/* Back to Dashboard Button */}
        <button
          onClick={() => navigate('/userDashboard')}
          className="absolute left-2 md:left-4 top-2 md:top-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs md:text-sm font-semibold bg-blue-50 px-2 md:px-3 py-1 rounded-lg shadow-sm border border-blue-100 transition z-10"
        >
          <ArrowLeftIcon className="w-3 h-3 md:w-4 md:h-4" /> 
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        {/* Left Side - Avatar and Basic Info */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center md:border-r md:border-blue-100 md:pr-6 mb-4 md:mb-0">
          {/* Avatar and Role Badge */}
          <div className="relative mb-3 md:mb-4">
            <div className="w-20 h-20 md:w-24 md:h-24 shadow-lg rounded-full overflow-hidden border-4 border-white bg-gradient-to-tr from-blue-400 to-indigo-400 flex items-center justify-center">
              <img
                src={user.photoURL || 'https://i.ibb.co/2kR6YQk/default-avatar.png'}
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Role Badge */}
            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-white uppercase tracking-wide flex items-center gap-1">
              <ShieldCheckIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{role || 'User'}</span>
              <span className="sm:hidden">User</span>
            </span>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1 text-center">
            {user.displayName || 'No Name Provided'}
          </h2>
          <p className="text-blue-600 font-medium mb-3 text-center text-xs md:text-sm">{user.email || 'No Email'}</p>
          
          {/* Quick Stats */}
          <div className="w-full space-y-2">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-600">UID:</span>
                <span className="text-gray-500 text-xs truncate max-w-20 md:max-w-24">{user.uid}</span>
              </div>
            </div>
            {joinDate && (
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-600">Joined:</span>
                  <span className="text-gray-500">{joinDate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="mt-3 md:mt-4 w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-xs md:text-sm"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {/* Right Side - Detailed Information */}
        <div className="w-full md:w-2/3 md:pl-6 flex flex-col">
          {/* User Role Info */}
          <div className="mb-3 md:mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <AcademicCapIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <h3 className="text-sm md:text-base font-bold text-blue-700">User Role</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                As a user, you can browse scholarships, apply for opportunities, and track your applications. 
                You have access to view scholarship details and submit applications for available programs.
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="mb-3 md:mb-4">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm md:text-base font-bold text-blue-700">Profile Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center gap-2 text-xs">
                  <UserIcon className="w-3 h-3 text-blue-500" />
                  <span className="font-semibold text-gray-600">Name:</span>
                  <span className="text-gray-700 truncate">{user.displayName || 'No Name'}</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center gap-2 text-xs">
                  <EnvelopeIcon className="w-3 h-3 text-blue-500" />
                  <span className="font-semibold text-gray-600">Email:</span>
                  <span className="text-gray-700 truncate">{user.email || 'No Email'}</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheckIcon className="w-3 h-3 text-blue-500" />
                  <span className="font-semibold text-gray-600">Role:</span>
                  <span className="text-blue-700 font-bold uppercase">{role || 'User'}</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center gap-2 text-xs">
                  <ClockIcon className="w-3 h-3 text-blue-500" />
                  <span className="font-semibold text-gray-600">Status:</span>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="mb-3 md:mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm md:text-base font-bold text-blue-700">Account Details</h3>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-600">User ID:</span>
                  <span className="text-gray-500 text-xs truncate max-w-24 md:max-w-32">{user.uid}</span>
                </div>
              </div>
              {joinDate && (
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CalendarIcon className="w-3 h-3 text-blue-500" />
                    <span className="font-semibold text-gray-600">Member Since:</span>
                    <span className="text-gray-500">{joinDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Capabilities */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AcademicCapIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm md:text-base font-bold text-blue-700">Your Capabilities</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Browse Scholarships</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Apply for Programs</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Track Applications</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">View Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {message && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-xs md:text-sm font-semibold text-red-500 bg-white px-3 md:px-4 py-2 rounded-lg shadow-lg max-w-xs md:max-w-md">
          {message}
        </div>
      )}
    </div>
  );
}

export default MyProfile