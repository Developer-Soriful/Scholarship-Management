import React, { useState } from 'react'
import useAuth from '../../Auth/useAuth'
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';

const MyProfile = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-lg font-semibold">No user information available.</span>
      </div>
    );
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
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 py-10 px-2 w-full">
      <div className="relative bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center border border-blue-100 hover:shadow-[0_8px_40px_0_rgba(80,80,200,0.15)] transition-all duration-300">
        <div className="absolute -top-16 flex justify-center w-full">
          <div className="w-36 h-36 shadow-xl rounded-full overflow-hidden border-4 border-white bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center">
            <img
              src={user.photoURL || 'https://i.ibb.co/2kR6YQk/default-avatar.png'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="mt-24 w-full flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight text-center drop-shadow">{user.displayName || 'No Name Provided'}</h2>
          <p className="text-blue-600 font-medium mb-2 text-center">{user.email || 'No Email'}</p>
          <div className="w-16 border-b-2 border-blue-200 my-3"></div>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between bg-blue-50 rounded px-3 py-1">
              <span className="font-semibold text-gray-600">UID:</span>
              <span className="text-gray-500 text-xs break-all">{user.uid}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-lg tracking-wide"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
          {message && (
            <div className="mt-4 text-center text-sm font-semibold text-red-500">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProfile