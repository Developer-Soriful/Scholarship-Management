import React, { useState } from 'react';
import useAuth from '../../Auth/useAuth';
import useUserRole from '../../Auth/useUserRole';
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
    ClockIcon,
    ChartBarIcon,
    BellIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

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
        return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner /></div>;
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

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <div className="relative flex items-center justify-center w-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-10 px-4">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, x: -100, y: -100 }}
                    animate={{ opacity: 0.1, x: 0, y: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
                ></motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 100, y: 100 }}
                    animate={{ opacity: 0.1, x: 0, y: 0 }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                    className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
                ></motion.div>
            </div>
            
            <motion.div
                className="relative bg-white shadow-3xl rounded-3xl p-6 md:p-10 w-full max-w-5xl flex flex-col md:flex-row border border-blue-200 backdrop-blur-sm z-10"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                {/* Back to Dashboard Button */}
                <button
                    onClick={() => navigate('/userDashboard')}
                    className="absolute left-4 top-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-semibold bg-blue-50 px-3 py-1.5 rounded-full shadow-sm border border-blue-100 transition-all duration-300 transform hover:scale-105"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                </button>

                {/* Left Side - Avatar and Basic Info */}
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center md:border-r md:border-blue-100 md:pr-8 mb-6 md:mb-0 text-center">
                    {/* Avatar and Role Badge */}
                    <motion.div
                        className="relative mb-5"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 10, delay: 0.3 } }}
                    >
                        <div className="w-28 h-28 md:w-32 md:h-32 shadow-xl rounded-full overflow-hidden border-4 border-white bg-gradient-to-tr from-blue-400 to-indigo-400 flex items-center justify-center">
                            <img
                                src={user.photoURL || 'https://i.ibb.co/2kR6YQk/default-avatar.png'}
                                alt="User Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Role Badge */}
                        <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md border-2 border-white uppercase tracking-wide flex items-center gap-1.5 transform translate-x-1 translate-y-1">
                            <ShieldCheckIcon className="w-4 h-4" />
                            {role || 'User'}
                        </span>
                    </motion.div>

                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 leading-tight">
                        {user.displayName || 'Unnamed User'}
                    </h2>
                    <p className="text-blue-600 font-medium mb-4 text-sm md:text-base break-all">{user.email || 'No Email'}</p>

                    {/* Quick Stats */}
                    <motion.div
                        className="w-full space-y-3"
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    >
                        <motion.div className="bg-blue-50 rounded-xl p-3 shadow-sm border border-blue-100" variants={itemVariants}>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-gray-700">Account Type:</span>
                                <span className="text-blue-700 font-bold uppercase">{role || 'User'}</span>
                            </div>
                        </motion.div>
                        {joinDate && (
                            <motion.div className="bg-blue-50 rounded-xl p-3 shadow-sm border border-blue-100" variants={itemVariants}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-gray-700">Member Since:</span>
                                    <span className="text-gray-600">{joinDate}</span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Logout Button */}
                    <motion.button
                        onClick={handleLogout}
                        disabled={loading}
                        className="mt-6 w-full py-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base transform hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={itemVariants}
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        {loading ? 'Logging out...' : 'Logout'}
                    </motion.button>
                </div>

                {/* Right Side - Detailed Information & Capabilities */}
                <div className="w-full md:w-2/3 md:pl-8 flex flex-col">
                    {/* User Role Info */}
                    <motion.div className="mb-6" variants={itemVariants}>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 shadow-inner">
                            <div className="flex items-center gap-3 mb-2">
                                <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg md:text-xl font-bold text-blue-700">Your Role & Permissions</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                As a user, you have the ability to **browse scholarships**, **apply for opportunities**, and **track your application status**. You can also **post reviews** for universities you have applied to, helping future students make informed decisions.
                            </p>
                        </div>
                    </motion.div>

                    {/* User Capabilities */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-2 mb-4">
                            <ChartBarIcon className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg md:text-xl font-bold text-blue-700">Key Features for You</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <motion.div className="bg-green-50 rounded-xl p-4 border border-green-100 shadow-sm" variants={itemVariants}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                                        <MagnifyingGlassIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-green-800">Browse & Discover</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">Find scholarships that match your academic goals and preferences.</p>
                            </motion.div>
                            <motion.div className="bg-green-50 rounded-xl p-4 border border-green-100 shadow-sm" variants={itemVariants}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-green-800">Submit Applications</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">Easily apply for scholarships with a streamlined application process.</p>
                            </motion.div>
                            <motion.div className="bg-green-50 rounded-xl p-4 border border-green-100 shadow-sm" variants={itemVariants}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                                        <ClockIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-green-800">Track Progress</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">Monitor your application status in real-time on your dashboard.</p>
                            </motion.div>
                            <motion.div className="bg-green-50 rounded-xl p-4 border border-green-100 shadow-sm" variants={itemVariants}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                                        <BellIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-green-800">Get Notifications</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">Receive timely alerts about your application feedback.</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Error Message */}
            {message && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-xs md:text-sm font-semibold text-red-500 bg-white px-4 py-2 rounded-lg shadow-lg max-w-xs md:max-w-md z-20">
                    {message}
                </div>
            )}
        </div>
    );
};

export default MyProfile;