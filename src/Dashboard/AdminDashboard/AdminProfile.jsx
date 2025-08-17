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
  AcademicCapIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const AdminProfile = () => {
  const { user, logoutUser } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    <div className="relative flex items-start justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 py-6 px-4 md:px-8 w-full min-h-[90vh] overflow-y-auto font-sans">
      
      {/* Animated SVG background shapes */}
      <svg className="absolute left-0 top-0 w-32 h-32 md:w-48 md:h-48 opacity-10 animate-pulse pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#10b981" d="M44.8,-67.2C56.6,-59.7,62.7,-42.2,68.2,-25.6C73.7,-9,78.6,6.7,74.2,20.2C69.8,33.7,56.1,45,41.2,54.2C26.3,63.4,10.1,70.5,-7.2,74.2C-24.5,77.9,-42.9,78.2,-54.7,68.2C-66.5,58.2,-71.7,37.9,-72.2,19.1C-72.7,0.3,-68.5,-16.9,-60.2,-30.7C-51.9,-44.5,-39.5,-54.9,-25.6,-61.7C-11.7,-68.5,4.7,-71.7,20.7,-70.1C36.7,-68.5,52.9,-62.7,44.8,-67.2Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute right-0 bottom-0 w-24 h-24 md:w-32 md:h-32 opacity-10 animate-pulse pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#059669" d="M44.8,-67.2C56.6,-59.7,62.7,-42.2,68.2,-25.6C73.7,-9,78.6,6.7,74.2,20.2C69.8,33.7,56.1,45,41.2,54.2C26.3,63.4,10.1,70.5,-7.2,74.2C-24.5,77.9,-42.9,78.2,-54.7,68.2C-66.5,58.2,-71.7,37.9,-72.2,19.1C-72.7,0.3,-68.5,-16.9,-60.2,-30.7C-51.9,-44.5,-39.5,-54.9,-25.6,-61.7C-11.7,-68.5,4.7,-71.7,20.7,-70.1C36.7,-68.5,52.9,-62.7,44.8,-67.2Z" transform="translate(100 100)" />
      </svg>

      <div className="relative bg-white shadow-2xl rounded-2xl p-6 md:p-8 w-full max-w-5xl border border-emerald-100 hover:shadow-[0_8px_40px_0_rgba(16,185,129,0.15)] transition-all duration-300">
        
        {/* Back to Dashboard Button */}
        <button
          onClick={() => navigate('/admindashboard')}
          className="absolute left-4 top-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-800 text-sm font-semibold bg-emerald-50 px-3 py-1.5 rounded-full shadow-sm border border-emerald-100 transition z-10"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>

        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-tr from-emerald-400 to-green-500 flex items-center justify-center">
              <img
                src={user.photoURL || 'https://i.ibb.co/2kR6YQk/default-avatar.png'}
                alt="Admin Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Role Badge */}
            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md border-2 border-white uppercase tracking-wide flex items-center gap-1">
              <ShieldCheckIcon className="w-3 h-3" />
              <span>Admin</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
            {user.displayName || 'No Name Provided'}
          </h1>
          <p className="text-emerald-600 font-medium text-lg">{user.email || 'No Email'}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - User Details and Logout */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 md:p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <InformationCircleIcon className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-emerald-700">User Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-emerald-100 shadow-sm">
                  <IdentificationIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="font-semibold text-gray-600 text-sm">Full Name</span>
                    <p className="text-gray-800 text-base font-medium">{user.displayName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-emerald-100 shadow-sm">
                  <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="font-semibold text-gray-600 text-sm">Email Address</span>
                    <p className="text-gray-800 text-base font-medium truncate">{user.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-emerald-100 shadow-sm">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="font-semibold text-gray-600 text-sm">Member Since</span>
                    <p className="text-gray-800 text-base font-medium">{joinDate || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full py-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-lg"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          {/* Right Columns - Capabilities & Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Admin Role Description Card */}
            <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <AcademicCapIcon className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-emerald-700">Administrator Role</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                As a system administrator, you have complete authority to manage all aspects of the scholarship platform. Your responsibilities include overseeing user accounts, approving or rejecting scholarship applications, and monitoring the overall health of the system through detailed analytics.
              </p>
            </div>

            {/* Core Capabilities Section */}
            <div>
              <h3 className="text-lg font-bold text-emerald-700 mb-4">Core Capabilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <UserGroupIcon className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-base font-semibold text-gray-800">User Management</h4>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Manage all user accounts and their profiles.</li>
                    <li>Assign or change user roles (e.g., admin, student, etc.).</li>
                    <li>Monitor user activity and participation.</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <ChartBarIcon className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-base font-semibold text-gray-800">System Control & Analytics</h4>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Oversee all scholarships and applications.</li>
                    <li>Access real-time system analytics and reports.</li>
                    <li>Ensure data integrity and system security.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div>
              <h3 className="text-lg font-bold text-emerald-700 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/admindashboard/managescholarshipadmin')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white font-semibold shadow-md hover:from-emerald-600 hover:to-green-600 transition-all duration-200 text-center"
                >
                  <AcademicCapIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs">Scholarships</span>
                </button>
                <button
                  onClick={() => navigate('/admindashboard/manageuser')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold shadow-md hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-center"
                >
                  <UserGroupIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs">Users</span>
                </button>
                <button
                  onClick={() => navigate('/admindashboard/managereview')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-center"
                >
                  <CogIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs">Reviews</span>
                </button>
                <button
                  onClick={() => navigate('/admindashboard/applications')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-semibold shadow-md hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 text-center"
                >
                  <ChartBarIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs">Applications</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {message && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-sm font-semibold text-red-600 bg-white px-4 py-2 rounded-lg shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminProfile;