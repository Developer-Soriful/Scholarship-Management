import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import LoadingSpinner from '../../Components/LoadingSpinner';
import Swal from 'sweetalert2';
import { FaEye, FaComment, FaTimes, FaCheck, FaClock, FaSpinner, FaSortAlphaDown, FaSortAlphaUp, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa';
import useAuth from '../../Auth/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DocumentMagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    TrashIcon,
    ClockIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const fetchAppliedScholarships = async () => {
    const res = await axiosSecure.get('/allApplied-scholarship');
    return res.data;
};

const updateApplicationStatus = async ({ id, status }) => {
    return axiosSecure.patch(`/applied-scholarship/${id}`, { status });
};

const sendFeedback = async ({ id, feedback }) => {
    return axiosSecure.patch(`/applied-scholarship-feedback/${id}`, { feedback });
};

const deleteApplication = async (id) => {
    return axiosSecure.delete(`/applied-scholarship/${id}`);
};

const AllAppliedApplications = () => {
    const queryClient = useQueryClient();
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    const { user } = useAuth();

    const { data: applications = [], isLoading, refetch } = useQuery({
        queryKey: ['applied-scholarships'],
        queryFn: fetchAppliedScholarships,
        enabled: !!user,
    });

    const filteredApplications = applications.filter(app => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;
        return (
            app.userName?.toLowerCase().includes(search) ||
            app.userEmail?.toLowerCase().includes(search) ||
            app.university?.toLowerCase().includes(search)
        );
    });

    const sortedApplications = [...filteredApplications].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const deadlineA = new Date(a.scholarshipDeadline);
        const deadlineB = new Date(b.scholarshipDeadline);

        if (sortBy === 'date-desc') {
            return dateB - dateA;
        } else if (sortBy === 'date-asc') {
            return dateA - dateB;
        } else if (sortBy === 'deadline-desc') {
            return deadlineB - deadlineA;
        } else if (sortBy === 'deadline-asc') {
            return deadlineA - deadlineB;
        }
        return 0;
    });

    const updateStatusMutation = useMutation({
        mutationFn: updateApplicationStatus,
        onSuccess: () => {
            queryClient.invalidateQueries(['applied-scholarships']);
            Swal.fire({
                icon: 'success',
                title: 'Status updated successfully!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
            });
        },
        onError: () => {
            Swal.fire({
                icon: 'error',
                title: 'Failed to update status',
                text: 'Something went wrong. Please try again.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        },
    });

    const feedbackMutation = useMutation({
        mutationFn: sendFeedback,
        onSuccess: () => {
            queryClient.invalidateQueries(['applied-scholarships']);
            setShowFeedbackModal(false);
            setFeedback('');
            setSelectedApplication(null);
            Swal.fire({
                icon: 'success',
                title: 'Feedback submitted!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
            });
        },
        onError: () => {
            Swal.fire({
                icon: 'error',
                title: 'Failed to submit feedback',
                text: 'Something went wrong. Please try again.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: deleteApplication,
        onSuccess: () => {
            queryClient.invalidateQueries(['applied-scholarships']);
            Swal.fire({
                icon: 'success',
                title: 'Application cancelled!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
            });
        },
        onError: () => {
            Swal.fire({
                icon: 'error',
                title: 'Failed to cancel application',
                text: 'Something went wrong. Please try again.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        },
    });

    const handleStatusUpdate = (applicationId, newStatus) => {
        updateStatusMutation.mutate({ id: applicationId, status: newStatus });
    };

    const handleDetails = (application) => {
        setSelectedApplication(application);
        setShowDetailsModal(true);
    };

    const handleFeedback = (application) => {
        setSelectedApplication(application);
        setShowFeedbackModal(true);
    };

    const handleCancel = (applicationId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
        }).then((result) => {
            if (result.isConfirmed) {
                cancelMutation.mutate(applicationId);
            }
        });
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        if (!feedback.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Feedback is required',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
            });
            return;
        }
        feedbackMutation.mutate({ id: selectedApplication._id, feedback });
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { text: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <ClockIcon className="w-4 h-4" /> };
            case 'processing':
                return { text: 'Processing', color: 'bg-purple-100 text-purple-700', icon: <FaSpinner className="w-4 h-4 animate-spin" /> };
            case 'completed':
                return { text: 'Completed', color: 'bg-green-100 text-green-700', icon: <FaCheck className="w-4 h-4" /> };
            default:
                return { text: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: null };
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-[75vh]"><LoadingSpinner /></div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-[75vh] w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl md:text-4xl font-extrabold text-purple-800 tracking-tight">
                    All Scholarship Applications
                </h1>
                <button
                    onClick={() => refetch()}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition transform hover:scale-105 flex items-center gap-2 font-semibold text-sm w-full sm:w-auto"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                    Refresh Data
                </button>
            </div>

            {/* Search and Sort Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, or university..."
                        className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm transition-all"
                    />
                </div>
                <div className="col-span-1 md:col-span-1">
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm cursor-pointer transition-all"
                    >
                        <option value="date-desc">Applied Date (Newest)</option>
                        <option value="date-asc">Applied Date (Oldest)</option>
                        <option value="deadline-desc">Deadline (Soonest)</option>
                        <option value="deadline-asc">Deadline (Latest)</option>
                    </select>
                </div>
                <div className="col-span-1 flex flex-col sm:flex-row gap-2 md:gap-4 lg:gap-2 justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-full p-2 shadow-sm">
                        <ClockIcon className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold text-gray-800">{applications.filter(app => app.status === 'pending').length}</span>
                        <span className="hidden sm:inline">Pending</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-full p-2 shadow-sm">
                        <FaCheck className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-gray-800">{applications.filter(app => app.status === 'completed').length}</span>
                        <span className="hidden sm:inline">Completed</span>
                    </div>
                </div>
            </div>

            {/* Application List */}
            {sortedApplications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-purple-100">
                    <p className="text-gray-500 text-lg">No applications match your search or filter criteria.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl shadow-xl bg-white border border-purple-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="py-4 px-6 text-left text-sm font-bold">Applicant</th>
                                    <th className="py-4 px-6 text-left text-sm font-bold">Scholarship</th>
                                    <th className="py-4 px-6 text-left text-sm font-bold">University</th>
                                    <th className="py-4 px-6 text-left text-sm font-bold">Applied Date</th>
                                    <th className="py-4 px-6 text-left text-sm font-bold">Status</th>
                                    <th className="py-4 px-6 text-center text-sm font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <AnimatePresence>
                                    {sortedApplications.map((application, index) => {
                                        const statusInfo = getStatusInfo(application.status);
                                        return (
                                            <motion.tr
                                                key={application._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="hover:bg-purple-50 transition"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={application.photo}
                                                            alt={application.userName}
                                                            className="w-10 h-10 rounded-full mr-3 border border-gray-200 object-cover"
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=U'; }}
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{application.userName}</p>
                                                            <p className="text-xs text-gray-500">{application.userEmail}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="font-medium text-gray-900">{application.scholarshipCategory}</p>
                                                    <p className="text-xs text-gray-500">{application.subjectCategory}</p>
                                                </td>
                                                <td className="py-4 px-6 text-gray-700">{application.university}</td>
                                                <td className="py-4 px-6 text-gray-500 text-sm">{new Date(application.date).toLocaleDateString()}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                                                            {statusInfo.icon} {statusInfo.text}
                                                        </span>
                                                        <select
                                                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
                                                            value={application.status}
                                                            onChange={(e) => handleStatusUpdate(application._id, e.target.value)}
                                                            disabled={updateStatusMutation.isLoading}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="completed">Completed</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleDetails(application)}
                                                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                                                            title="View Details"
                                                        >
                                                            <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleFeedback(application)}
                                                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                                                            title="Add Feedback"
                                                        >
                                                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(application._id)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                            title="Cancel Application"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                        <AnimatePresence>
                            {sortedApplications.map((application, index) => {
                                const statusInfo = getStatusInfo(application.status);
                                return (
                                    <motion.div
                                        key={application._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="bg-white rounded-2xl shadow-lg border border-purple-100 p-5 space-y-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={application.photo}
                                                alt={application.userName}
                                                className="w-14 h-14 rounded-full border-2 border-purple-200 object-cover"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/56x56?text=U'; }}
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 text-lg">{application.userName}</h3>
                                                <p className="text-gray-500 text-sm truncate">{application.userEmail}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleDetails(application)} className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition" title="View Details">
                                                    <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleFeedback(application)} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition" title="Add Feedback">
                                                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleCancel(application._id)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition" title="Cancel Application">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">University:</p>
                                                    <p>{application.university}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">Scholarship:</p>
                                                    <p>{application.scholarshipCategory}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">Applied:</p>
                                                    <p>{new Date(application.date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">Status:</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                                                            {statusInfo.icon} {statusInfo.text}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-gray-100">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Update Status:</label>
                                                <select
                                                    className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                                                    value={application.status}
                                                    onChange={(e) => handleStatusUpdate(application._id, e.target.value)}
                                                    disabled={updateStatusMutation.isLoading}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedApplication && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}></div>
                        <motion.div
                            className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        >
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                            <h3 className="text-2xl md:text-3xl font-extrabold text-purple-700 text-center mb-6">Application Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Applicant Info */}
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h4 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> Applicant Information</h4>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <p><span className="font-semibold">Name:</span> {selectedApplication.userName}</p>
                                        <p><span className="font-semibold">Email:</span> {selectedApplication.userEmail}</p>
                                        <p><span className="font-semibold">Phone:</span> {selectedApplication.phone || 'N/A'}</p>
                                        <p><span className="font-semibold">Gender:</span> {selectedApplication.gender || 'N/A'}</p>
                                        <p><span className="font-semibold">Address:</span> {selectedApplication.address || 'N/A'}</p>
                                    </div>
                                </div>
                                {/* Academic Info */}
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h4 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0L3.824 5.378a1 1 0 00-.775 1.053l1.248 7.218A1 1 0 004.832 15h10.336a1 1 0 00.985-.701l1.248-7.218a1 1 0 00-.775-1.053L10.394 2.08z" /><path fillRule="evenodd" d="M15 16.5a1.5 1.5 0 01-3 0V15.5a1.5 1.5 0 013 0v1zM6.5 16.5a1.5 1.5 0 01-3 0V15.5a1.5 1.5 0 013 0v1z" clipRule="evenodd" /></svg> Academic Information</h4>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <p><span className="font-semibold">Degree:</span> {selectedApplication.degree || 'N/A'}</p>
                                        <p><span className="font-semibold">SSC Result:</span> {selectedApplication.ssc || 'N/A'}</p>
                                        <p><span className="font-semibold">HSC Result:</span> {selectedApplication.hsc || 'N/A'}</p>
                                        <p><span className="font-semibold">Study Gap:</span> {selectedApplication.studyGap || 'N/A'}</p>
                                    </div>
                                </div>
                                {/* Scholarship Info */}
                                <div className="p-4 bg-gray-50 rounded-xl md:col-span-2">
                                    <h4 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.707 3.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg> Scholarship Information</h4>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <p><span className="font-semibold">University:</span> {selectedApplication.university || 'N/A'}</p>
                                        <p><span className="font-semibold">Category:</span> {selectedApplication.scholarshipCategory || 'N/A'}</p>
                                        <p><span className="font-semibold">Subject:</span> {selectedApplication.subjectCategory || 'N/A'}</p>
                                        <p><span className="font-semibold">Applied Date:</span> {new Date(selectedApplication.date).toLocaleDateString()}</p>
                                        <p>
                                            <span className="font-semibold">Current Status:</span>
                                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusInfo(selectedApplication.status).color}`}>
                                                {getStatusInfo(selectedApplication.status).icon} {getStatusInfo(selectedApplication.status).text}
                                            </span>
                                        </p>
                                        {selectedApplication.feedback && (
                                            <div className="pt-2 border-t mt-4">
                                                <p className="font-semibold text-gray-800">Feedback:</p>
                                                <p className="mt-1 text-gray-600">{selectedApplication.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <AnimatePresence>
                {showFeedbackModal && selectedApplication && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)}></div>
                        <motion.div
                            className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        >
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                            <h3 className="text-2xl md:text-3xl font-extrabold text-purple-700 text-center mb-6">Add Feedback</h3>
                            <form onSubmit={handleFeedbackSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Feedback for <span className="text-purple-600">{selectedApplication.userName}</span>
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
                                        rows="5"
                                        placeholder="Enter your feedback or notes here..."
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowFeedbackModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={feedbackMutation.isLoading || !feedback.trim()}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {feedbackMutation.isLoading ? 'Submitting...' : 'Submit Feedback'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllAppliedApplications;