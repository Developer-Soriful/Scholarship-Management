import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import LoadingSpinner from '../../Components/LoadingSpinner';
import Swal from 'sweetalert2';
import { FaEye, FaCheckCircle, FaTimesCircle, FaComment, FaClock, FaSpinner } from 'react-icons/fa';
import useAuth from '../../Auth/useAuth';
import { motion } from 'framer-motion';

const fetchAppliedScholarships = async () => {
    const res = await axiosSecure.get('/allApplied-scholarship');
    return res.data;
};

const updateApplicationStatus = async ({ id, status }) => {
    const res = await axiosSecure.patch(`/applied-scholarship/${id}`, { status });
    return res.data;
};

const ManageAppliedApplication = () => {
    const queryClient = useQueryClient();
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [searchTerm, setSearchTerm] = useState('');

    const { user } = useAuth();

    const { data: applications = [], isLoading } = useQuery({
        queryKey: ['applied-scholarships'],
        queryFn: fetchAppliedScholarships,
        enabled: !!user,
    });

    const filteredApplications = applications.filter(app => {
        const matchesStatus = filterStatus === 'all' ? true : app.status === filterStatus;
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch =
            app.userName?.toLowerCase().includes(search) ||
            app.userEmail?.toLowerCase().includes(search) ||
            app.university?.toLowerCase().includes(search) ||
            app.scholarshipName?.toLowerCase().includes(search);
        return matchesStatus && (search === '' || matchesSearch);
    });

    const sortedApplications = [...filteredApplications].sort((a, b) => {
        if (sortBy === 'date-desc') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'date-asc') {
            return new Date(a.date) - new Date(b.date);
        } else if (sortBy === 'deadline-desc') {
            return new Date(b.scholarshipDeadline) - new Date(a.scholarshipDeadline);
        } else if (sortBy === 'deadline-asc') {
            return new Date(a.scholarshipDeadline) - new Date(b.scholarshipDeadline);
        }
        return 0;
    });

    const updateStatusMutation = useMutation({
        mutationFn: updateApplicationStatus,
        onSuccess: () => {
            queryClient.invalidateQueries(['applied-scholarships']);
            Swal.fire({
                icon: 'success',
                title: 'Status updated!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Update failed',
                text: error.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        },
    });

    const handleAccept = (applicationId) => {
        updateStatusMutation.mutate({ id: applicationId, status: 'completed' });
    };

    const handleReject = (applicationId) => {
        updateStatusMutation.mutate({ id: applicationId, status: 'rejected' });
    };

    const handleDetails = (application) => {
        setSelectedApplication(application);
        setShowDetailsModal(true);
    };

    const handleFeedback = (application) => {
        setSelectedApplication(application);
        setShowFeedbackModal(true);
    };

    const handleCancel = async (applicationId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action will cancel the application permanently.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it',
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                await axiosSecure.delete(`/applied-scholarship/${applicationId}`);
                queryClient.invalidateQueries(['applied-scholarships']);
                Swal.fire({
                    icon: 'success',
                    title: 'Application cancelled!',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Cancellation failed',
                    text: error.message,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        }
    };

    const handleFeedbackSubmit = async () => {
        if (!feedback.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Feedback is required',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }
        try {
            await axiosSecure.patch(`/applied-scholarship-feedback/${selectedApplication._id}`, { feedback });
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
                timerProgressBar: true,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Feedback submission failed',
                text: error.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <FaClock className="text-yellow-500" />;
            case 'processing': return <FaSpinner className="text-blue-500 animate-spin" />;
            case 'completed': return <FaCheckCircle className="text-green-500" />;
            case 'rejected': return <FaTimesCircle className="text-red-500" />;
            default: return <FaClock className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className=" min-h-screen font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 md:p-8"
            >
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-teal-500 pb-2">
                    Manage Applied Applications
                </h2>

                {/* Filter & Sort Controls */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by name, university, or scholarship..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                        />
                    </div>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                        >
                            <option value="date-desc">Applied Date (Newest)</option>
                            <option value="date-asc">Applied Date (Oldest)</option>
                            <option value="deadline-desc">Deadline (Newest)</option>
                            <option value="deadline-asc">Deadline (Oldest)</option>
                        </select>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-white">
                        <thead className="bg-teal-600 text-white">
                            <tr>
                                <th className="py-4 px-6 text-left text-sm font-semibold">Applicant</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold">Scholarship</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold hidden md:table-cell">University</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold">Status</th>
                                <th className="py-4 px-6 text-center text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedApplications.map(application => (
                                <tr key={application._id} className="border-b border-gray-100 hover:bg-teal-50 transition duration-200">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={application.photo}
                                                alt={application.userName}
                                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                onError={(e) => { e.target.src = 'https://i.ibb.co/2kR6YQk/default-avatar.png'; }}
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800">{application.userName}</p>
                                                <p className="text-sm text-gray-500">{application.userEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-medium text-gray-800">{application.scholarshipName}</p>
                                        <p className="text-sm text-gray-500">{application.subjectCategory}</p>
                                    </td>
                                    <td className="py-4 px-6 hidden md:table-cell">
                                        <p className="text-gray-700">{application.university}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(application.status)}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                {application.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center space-x-2">
                                            {application.status !== 'completed' && application.status !== 'rejected' && (
                                                <>
                                                    <motion.button
                                                        onClick={() => handleAccept(application._id)}
                                                        className="p-3 text-green-600 hover:bg-green-100 rounded-full transition-transform hover:scale-110"
                                                        title="Accept"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FaCheckCircle />
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleReject(application._id)}
                                                        className="p-3 text-red-600 hover:bg-red-100 rounded-full transition-transform hover:scale-110"
                                                        title="Reject"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FaTimesCircle />
                                                    </motion.button>
                                                </>
                                            )}
                                            <motion.button
                                                onClick={() => handleDetails(application)}
                                                className="p-3 text-blue-600 hover:bg-blue-100 rounded-full transition-transform hover:scale-110"
                                                title="View Details"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <FaEye />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => handleFeedback(application)}
                                                className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-transform hover:scale-110"
                                                title="Add Feedback"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <FaComment />
                                            </motion.button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sortedApplications.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-lg text-gray-400">
                                        No applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Details Modal */}
            {showDetailsModal && selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-teal-700">Application Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-3xl transition"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-2">Applicant Info</h4>
                                <p className="text-gray-600"><span className="font-medium text-gray-800">Name:</span> {selectedApplication.userName}</p>
                                <p className="text-gray-600"><span className="font-medium text-gray-800">Email:</span> {selectedApplication.userEmail}</p>
                                <p className="text-gray-600"><span className="font-medium text-gray-800">Phone:</span> {selectedApplication.phone}</p>
                                <p className="text-gray-600"><span className="font-medium text-gray-800">Gender:</span> {selectedApplication.gender}</p>
                                <p className="text-gray-600"><span className="font-medium text-gray-800">Address:</span> {selectedApplication.address}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-2">Academic Info</h4>
                                <p className="text-gray-600"><span className="font-medium text-gray-800">Degree:</span> {selectedApplication.degree}</p>
                                <p className="text-gray-600"><span className="font-medium text-gray-800">SSC Result:</span> {selectedApplication.ssc}</p>
                                <p className="text-gray-600"><span className="font-medium text-gray-800">HSC Result:</span> {selectedApplication.hsc}</p>
                                <p className="text-gray-600"><span className="font-medium text-gray-800">Study Gap:</span> {selectedApplication.studyGap || 'N/A'}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-4 mt-4">
                                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-2">Scholarship Info</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
                                    <p><span className="font-medium text-gray-800">University:</span> {selectedApplication.university}</p>
                                    <p><span className="font-medium text-gray-800">Category:</span> {selectedApplication.scholarshipCategory}</p>
                                    <p><span className="font-medium text-gray-800">Subject:</span> {selectedApplication.subjectCategory}</p>
                                    <p><span className="font-medium text-gray-800">Applied Date:</span> {new Date(selectedApplication.date).toLocaleDateString()}</p>
                                    <p><span className="font-medium text-gray-800">Status:</span>
                                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                                            {selectedApplication.status}
                                        </span>
                                    </p>
                                    {selectedApplication.feedback && (
                                        <p className="col-span-full"><span className="font-medium text-gray-800">Feedback:</span> {selectedApplication.feedback}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow-sm hover:bg-gray-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full mx-4"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-teal-700">Add Feedback</h3>
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-3xl transition"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Feedback for <span className="font-bold">{selectedApplication.userName}</span>
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                                rows="5"
                                placeholder="Enter your feedback here..."
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFeedbackSubmit}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 transition"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManageAppliedApplication;