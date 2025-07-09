import React, { useState } from 'react';
import useAuth from '../../Auth/useAuth';
import useUserRole from '../../Auth/useUserRole';
import { useNavigate } from 'react-router';
import LoadingSpinner from '../../Components/LoadingSpinner';
import Swal from 'sweetalert2';
import { ArrowLeftOnRectangleIcon, ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

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
    <div className="relative flex items-center justify-center bg-gradient-to-br from-teal-100 via-blue-50 to-green-100 py-10 px-2 w-full">
      {/* Animated SVG background shape */}
      <svg className="absolute left-0 top-0 w-64 h-64 opacity-10 animate-pulse pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#14b8a6" d="M44.8,-67.2C56.6,-59.7,62.7,-42.2,68.2,-25.6C73.7,-9,78.6,6.7,74.2,20.2C69.8,33.7,56.1,45,41.2,54.2C26.3,63.4,10.1,70.5,-7.2,74.2C-24.5,77.9,-42.9,78.2,-54.7,68.2C-66.5,58.2,-71.7,37.9,-72.2,19.1C-72.7,0.3,-68.5,-16.9,-60.2,-30.7C-51.9,-44.5,-39.5,-54.9,-25.6,-61.7C-11.7,-68.5,4.7,-71.7,20.7,-70.1C36.7,-68.5,52.9,-62.7,44.8,-67.2Z" transform="translate(100 100)" />
      </svg>
      <div className="relative bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center border border-teal-100 hover:shadow-[0_8px_40px_0_rgba(20,180,180,0.15)] transition-all duration-300 animate-fade-in">
        {/* Back to Dashboard Button */}
        <button
          onClick={() => navigate('/admindashboard')}
          className="absolute left-4 top-4 flex items-center gap-1 text-teal-600 hover:text-teal-800 text-sm font-semibold bg-teal-50 px-3 py-1 rounded-lg shadow-sm border border-teal-100 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Dashboard
        </button>
        {/* Avatar and Role Badge */}
        <div className="absolute -top-16 flex flex-col items-center w-full">
          <div className="w-36 h-36 shadow-xl rounded-full mt-10 overflow-hidden border-4 border-white bg-gradient-to-tr from-teal-400 to-blue-400 flex items-center justify-center relative">
            <img
              src={user.photoURL || 'https://i.ibb.co/2kR6YQk/default-avatar.png'}
              alt="Admin Profile"
              className="w-full h-full object-cover"
            />
            {/* Role Badge */}
            <span className="absolute bottom-2 right-2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border-2 border-white uppercase tracking-wide">{role || 'Admin'}</span>
          </div>
        </div>
        <div className="mt-28 w-full flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight text-center drop-shadow">{user.displayName || 'No Name Provided'}</h2>
          <p className="text-teal-600 font-medium mb-2 text-center">{user.email || 'No Email'}</p>
          <div className="w-16 border-b-2 border-teal-200 my-3"></div>
          {/* Info Section */}
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between bg-teal-50 rounded px-3 py-1">
              <span className="font-semibold text-gray-600 flex items-center gap-1">UID
                <InformationCircleIcon className="w-4 h-4 text-gray-400" title="Unique User ID" />
              </span>
              <span className="text-gray-500 text-xs break-all">{user.uid}</span>
            </div>
            <div className="flex items-center justify-between bg-teal-50 rounded px-3 py-1">
              <span className="font-semibold text-gray-600 flex items-center gap-1">Role
                <InformationCircleIcon className="w-4 h-4 text-gray-400" title="User Role" />
              </span>
              <span className="text-teal-700 font-bold uppercase">{role || 'Admin'}</span>
            </div>
            {joinDate && (
              <div className="flex items-center justify-between bg-teal-50 rounded px-3 py-1">
                <span className="font-semibold text-gray-600">Joined</span>
                <span className="text-gray-500 text-xs">{joinDate}</span>
              </div>
            )}
          </div>
          {/* Section Title */}
          <div className="w-full mt-8 mb-2 flex items-center gap-2">
            <span className="text-xl font-bold text-teal-700">Admin Info</span>
            <div className="flex-1 border-b border-teal-100"></div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-1">
              <span className="font-semibold text-gray-600">Name:</span>
              <span className="text-gray-700">{user.displayName || 'No Name Provided'}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-1">
              <span className="font-semibold text-gray-600">Email:</span>
              <span className="text-gray-700">{user.email || 'No Email'}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-1">
              <span className="font-semibold text-gray-600">UID:</span>
              <span className="text-gray-700">{user.uid}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-1">
              <span className="font-semibold text-gray-600">Role:</span>
              <span className="text-teal-700 font-bold uppercase">{role || 'Admin'}</span>
            </div>
            {joinDate && (
              <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-1">
                <span className="font-semibold text-gray-600">Joined:</span>
                <span className="text-gray-700">{joinDate}</span>
              </div>
            )}
          </div>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="mt-8 w-full py-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold shadow-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-lg tracking-wide"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            {loading ? navigate('/signin') : 'Logout'}
          </button>
          {message && (
            <div className="mt-4 text-center text-sm font-semibold text-red-500">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
