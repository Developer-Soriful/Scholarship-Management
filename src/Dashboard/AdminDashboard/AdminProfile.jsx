import React, { useState } from 'react';
import useAuth from '../../Auth/useAuth';
import useUserRole from '../../Auth/useUserRole';
import { useNavigate } from 'react-router';
import LoadingSpinner from '../../Components/LoadingSpinner';
import Swal from 'sweetalert2';
import { 
  ArrowLeftOnRectangleIcon, 
  ArrowLeftIcon, 
  InformationCircleIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const AdminProfile = () => {
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
    <div className="relative flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 py-4 md:py-6 px-2 w-full h-[75vh] overflow-hidden">
      {/* Animated SVG background shapes */}
      <svg className="absolute left-0 top-0 w-32 h-32 md:w-48 md:h-48 opacity-10 animate-pulse pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#10b981" d="M44.8,-67.2C56.6,-59.7,62.7,-42.2,68.2,-25.6C73.7,-9,78.6,6.7,74.2,20.2C69.8,33.7,56.1,45,41.2,54.2C26.3,63.4,10.1,70.5,-7.2,74.2C-24.5,77.9,-42.9,78.2,-54.7,68.2C-66.5,58.2,-71.7,37.9,-72.2,19.1C-72.7,0.3,-68.5,-16.9,-60.2,-30.7C-51.9,-44.5,-39.5,-54.9,-25.6,-61.7C-11.7,-68.5,4.7,-71.7,20.7,-70.1C36.7,-68.5,52.9,-62.7,44.8,-67.2Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute right-0 bottom-0 w-24 h-24 md:w-32 md:h-32 opacity-10 animate-pulse pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#059669" d="M44.8,-67.2C56.6,-59.7,62.7,-42.2,68.2,-25.6C73.7,-9,78.6,6.7,74.2,20.2C69.8,33.7,56.1,45,41.2,54.2C26.3,63.4,10.1,70.5,-7.2,74.2C-24.5,77.9,-42.9,78.2,-54.7,68.2C-66.5,58.2,-71.7,37.9,-72.2,19.1C-72.7,0.3,-68.5,-16.9,-60.2,-30.7C-51.9,-44.5,-39.5,-54.9,-25.6,-61.7C-11.7,-68.5,4.7,-71.7,20.7,-70.1C36.7,-68.5,52.9,-62.7,44.8,-67.2Z" transform="translate(100 100)" />
      </svg>
      
      <div className="relative bg-white shadow-2xl rounded-2xl p-4 md:p-6 w-full max-w-5xl border border-emerald-100 hover:shadow-[0_8px_40px_0_rgba(16,185,129,0.15)] transition-all duration-300 h-full">
        {/* Back to Dashboard Button */}
        <button
          onClick={() => navigate('/admindashboard')}
          className="absolute left-2 md:left-4 top-2 md:top-4 flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs md:text-sm font-semibold bg-emerald-50 px-2 md:px-3 py-1 rounded-lg shadow-sm border border-emerald-100 transition z-10"
        >
          <ArrowLeftIcon className="w-3 h-3 md:w-4 md:h-4" /> 
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        {/* Header Section */}
        <div className="text-center mb-4">
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 md:w-24 md:h-24 shadow-xl rounded-full overflow-hidden border-4 border-white bg-gradient-to-tr from-emerald-400 to-green-500 flex items-center justify-center relative">
              <img
                src={user.photoURL || 'https://i.ibb.co/2kR6YQk/default-avatar.png'}
                alt="Admin Profile"
                className="w-full h-full object-cover"
              />
              {/* Crown Badge for Admin */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                {/* <CrownIcon className="w-4 h-4 md:w-5 md:h-5" /> */}
              </div>
            </div>
            {/* Role Badge */}
            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-white uppercase tracking-wide flex items-center gap-1">
              <ShieldCheckIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{role || 'Admin'}</span>
              <span className="sm:hidden">Admin</span>
            </span>
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
            {user.displayName || 'No Name Provided'}
          </h1>
          <p className="text-emerald-600 font-medium text-sm">{user.email || 'No Email'}</p>
          <div className="w-16 border-b-2 border-emerald-200 my-2 mx-auto"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          
          {/* Left Column - Admin Info */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                {/* <CrownIcon className="w-4 h-4 text-emerald-600" /> */}
                <h3 className="text-base font-bold text-emerald-700">Admin Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-emerald-100">
                  <span className="font-semibold text-gray-600 text-xs">Name:</span>
                  <span className="text-gray-700 text-xs truncate">{user.displayName || 'No Name'}</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-emerald-100">
                  <span className="font-semibold text-gray-600 text-xs">Email:</span>
                  <span className="text-gray-700 text-xs truncate">{user.email || 'No Email'}</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-emerald-100">
                  <span className="font-semibold text-gray-600 text-xs">UID:</span>
                  <span className="text-gray-500 text-xs truncate max-w-20">{user.uid}</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-emerald-100">
                  <span className="font-semibold text-gray-600 text-xs">Role:</span>
                  <span className="text-emerald-700 font-bold uppercase text-xs">{role || 'Admin'}</span>
                </div>
                {joinDate && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-emerald-100">
                    <span className="font-semibold text-gray-600 text-xs">Joined:</span>
                    <span className="text-gray-500 text-xs">{joinDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="mt-3 w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-xs md:text-sm"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          {/* Right Columns - Admin Capabilities */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Admin Role Description */}
              <div className="md:col-span-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <AcademicCapIcon className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-emerald-700">Administrator Role</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  As an administrator, you have complete control over the scholarship platform. 
                  You can manage users, scholarships, applications, and oversee the entire system.
                </p>
              </div>

              {/* Admin Capabilities */}
              <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <UserGroupIcon className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-emerald-700">User Management</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-600">Manage all user accounts</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-600">Assign user roles</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-600">Monitor activities</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBarIcon className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-emerald-700">System Control</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-600">Manage scholarships</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-600">Review applications</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-600">System analytics</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-emerald-700 mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <button 
                    onClick={() => navigate('/admindashboard/managescholarshipadmin')}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold py-2 px-2 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200"
                  >
                    Manage Scholarships
                  </button>
                  <button 
                    onClick={() => navigate('/admindashboard/manageuser')}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold py-2 px-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                  >
                    Manage Users
                  </button>
                  <button 
                    onClick={() => navigate('/admindashboard/managereview')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold py-2 px-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                  >
                    Manage Reviews
                  </button>
                  <button 
                    onClick={() => navigate('/admindashboard/manageappliedapplication')}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-semibold py-2 px-2 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all duration-200"
                  >
                    View Applications
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {message && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-xs md:text-sm font-semibold text-red-500 bg-white px-3 md:px-4 py-2 rounded-lg shadow-lg max-w-xs md:max-w-md">
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
