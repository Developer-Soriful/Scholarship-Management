import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import useAuth from '../../Auth/useAuth';
import Swal from 'sweetalert2';
import { FaTimes, FaEdit, FaTrash, FaStar, FaInfoCircle, FaSyncAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MyApplication = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [editApp, setEditApp] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewApp, setReviewApp] = useState(null);
    const [reviewRating, setReviewRating] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewDate, setReviewDate] = useState('');
    const [editForm, setEditForm] = useState({
        degree: '',
        address: '',
        subjectCategory: '',
        applicationFees: '',
        serviceCharge: '',
        status: '',
        feedback: ''
    });

    // Fetch user's applied scholarships
    const { data: applications = { data: [] }, isLoading, refetch } = useQuery({
        queryKey: ['my-applications', user?.email],
        queryFn: async () => {
            if (!user?.email) return { data: [] };
            const res = await axiosSecure.get(`/applied-scholarship?userEmail=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });

    // Handle form changes for the edit modal
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    // Edit mutation
    const editMutation = useMutation({
        mutationFn: async (updatedData) => {
            return axiosSecure.patch(`/applied-scholarship/${updatedData.id}`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['my-applications', user?.email]);
            setShowEditModal(false);
            setEditApp(null);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Application updated!',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
        },
        onError: (err) => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Failed to update',
                text: err?.response?.data?.message || err.message,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        },
    });

    // Cancel/Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return axiosSecure.delete(`/applied-scholarship/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['my-applications', user?.email]);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Application cancelled!',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
        },
        onError: (err) => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Failed to cancel',
                text: err?.response?.data?.message || err.message,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        },
    });

    // Review mutation
    const reviewMutation = useMutation({
        mutationFn: async (reviewData) => {
            return axiosSecure.put(`/MyScholarship/${reviewData.universityId}`, reviewData);
        },
        onSuccess: () => {
            setShowReviewModal(false);
            setReviewApp(null);
            setReviewRating('');
            setReviewComment('');
            setReviewDate('');
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Review submitted successfully!',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
        },
        onError: (err) => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Already Review this',
                text: err?.response?.data?.message || err.message,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        },
    });

    const handleEdit = (app) => {
        setEditApp(app);
        setEditForm({
            degree: app.degree,
            address: app.address,
            subjectCategory: app.subjectCategory,
            applicationFees: app.applicationFees || '',
            serviceCharge: app.serviceCharge || '',
            status: app.status || 'pending',
            feedback: app.feedback || ''
        });
        setShowEditModal(true);
    };

    const handleEditModalClose = () => {
        setShowEditModal(false);
        setEditApp(null);
    };

    const handleEditConfirm = (e) => {
        e.preventDefault();
        if (!editApp) return;

        // Check if any field has changed before submitting
        const hasChanged = Object.keys(editForm).some(key => editForm[key] !== (editApp[key] || ''));

        if (!hasChanged) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: 'No changes to save.',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
            handleEditModalClose();
            return;
        }

        const { degree, address, subjectCategory } = editForm;
        editMutation.mutate({
            id: editApp._id,
            degree,
            address,
            subjectCategory
        }, {
            onSuccess: () => {
                handleEditModalClose();
            }
        });
    };

    const handleCancel = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to cancel this application?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    const handleReview = (appId) => {
        const app = applications.data?.find(a => a._id === appId);
        setReviewApp(app);
        setShowReviewModal(true);
        setReviewRating('');
        setReviewComment('');
        setReviewDate(new Date().toISOString().slice(0, 10)); // default to today
    };

    const handleReviewModalClose = () => {
        setShowReviewModal(false);
        setReviewApp(null);
        setReviewRating('');
        setReviewComment('');
        setReviewDate('');
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!reviewApp || !reviewRating || !reviewComment || !reviewDate) return;

        const reviewData = {
            rating: parseInt(reviewRating),
            comment: reviewComment,
            date: reviewDate,
            scholarshipName: reviewApp.scholarshipName || reviewApp.scholarship || '',
            universityName: reviewApp.university,
            universityId: reviewApp.scholarshipId || reviewApp.universityId || '',
            userName: user.displayName,
            userImage: user.photoURL || '',
            userEmail: user.email,
        };

        reviewMutation.mutate(reviewData);
    };

    if (isLoading) return <div className="flex justify-center items-center h-[75vh]"><span className="loading loading-spinner loading-lg text-blue-600"></span></div>;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    };

    const getStatusBadge = (status) => {
        let color, text;
        switch (status) {
            case 'pending':
                color = 'bg-yellow-100 text-yellow-800';
                text = 'Pending';
                break;
            case 'processing':
                color = 'bg-blue-100 text-blue-800';
                text = 'Processing';
                break;
            case 'completed':
                color = 'bg-green-100 text-green-800';
                text = 'Completed';
                break;
            case 'rejected':
                color = 'bg-red-100 text-red-800';
                text = 'Rejected';
                break;
            default:
                color = 'bg-gray-100 text-gray-800';
                text = 'Unknown';
        }
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
    };

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 min-h-[75vh] w-full font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800">My Applications</h1>
                    <button onClick={refetch} className="mt-4 sm:mt-0 px-5 py-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                        <FaSyncAlt /> Refresh
                    </button>
                </div>

                <div className="overflow-x-auto rounded-3xl  bg-white border border-blue-100 animate-fadeInUp">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-4 py-4 text-left font-semibold text-sm sm:text-base">University Name</th>
                                <th className="px-4 py-4 text-left font-semibold text-sm sm:text-base">Address</th>
                                <th className="px-4 py-4 text-left font-semibold text-sm sm:text-base hidden md:table-cell">Subject</th>
                                <th className="px-4 py-4 text-left font-semibold text-sm sm:text-base hidden md:table-cell">Degree</th>
                                <th className="px-4 py-4 text-left font-semibold text-sm sm:text-base hidden lg:table-cell">Fees</th>
                                <th className="px-4 py-4 text-left font-semibold text-sm sm:text-base">Status</th>
                                <th className="px-4 py-4 text-left font-semibold text-sm sm:text-base">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {applications.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-lg text-gray-400 font-medium">No applications found. Start your journey now!</td>
                                </tr>
                            )}
                            {applications.data.map((app) => (
                                <tr key={app._id} className="hover:bg-blue-50 transition-colors duration-200">
                                    <td className="px-4 py-4 font-semibold text-gray-800">{app.university}</td>
                                    <td className="px-4 py-4 text-gray-600">{app.address}</td>
                                    <td className="px-4 py-4 text-gray-600 hidden md:table-cell">{app.subjectCategory}</td>
                                    <td className="px-4 py-4 text-gray-600 hidden md:table-cell">{app.degree}</td>
                                    <td className="px-4 py-4 text-gray-600 hidden lg:table-cell">${app.applicationFees || '-'}</td>
                                    <td className="px-4 py-4">
                                        {getStatusBadge(app.status)}
                                    </td>
                                    <td className="px-4 py-4 space-x-1 sm:space-x-2 flex items-center flex-wrap gap-2">
                                        {app.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(app)}
                                                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors tooltip"
                                                    data-tip="Edit"
                                                    disabled={editMutation.isLoading}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(app._id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors tooltip"
                                                    data-tip="Cancel"
                                                    disabled={deleteMutation.isLoading}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        )}
                                        {app.status === 'completed' && (
                                            <button
                                                onClick={() => handleReview(app._id)}
                                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors tooltip"
                                                data-tip="Add Review"
                                            >
                                                <FaStar />
                                            </button>
                                        )}
                                        {/* Optional: Details button for all statuses */}
                                        <button
                                            onClick={() => Swal.fire({
                                                title: 'Application Details',
                                                html: `
                                                    <p><strong>University:</strong> ${app.university}</p>
                                                    <p><strong>Address:</strong> ${app.address}</p>
                                                    <p><strong>Subject:</strong> ${app.subjectCategory}</p>
                                                    <p><strong>Degree:</strong> ${app.degree}</p>
                                                    <p><strong>Application Fees:</strong> $${app.applicationFees || '-'}</p>
                                                    <p><strong>Service Charge:</strong> $${app.serviceCharge || '-'}</p>
                                                    <p><strong>Status:</strong> ${app.status}</p>
                                                    <p><strong>Feedback:</strong> ${app.feedback || 'No feedback yet.'}</p>
                                                `,
                                                icon: 'info',
                                                confirmButtonText: 'Close'
                                            })}
                                            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors tooltip"
                                            data-tip="View Details"
                                        >
                                            <FaInfoCircle />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals with Framer Motion */}
            <AnimatePresence>
                {showEditModal && editApp && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-blue-100 animate-slideUp"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <button onClick={handleEditModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors focus:outline-none" aria-label="Close"><FaTimes /></button>
                            <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">Edit Application</h3>
                            <form className="space-y-5" onSubmit={handleEditConfirm}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
                                        <input type="text" value={editApp.university} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                                        <input type="text" name="address" value={editForm.address} onChange={handleEditFormChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required disabled={editMutation.isLoading} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Category</label>
                                        <input type="text" name="subjectCategory" value={editForm.subjectCategory} onChange={handleEditFormChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required disabled={editMutation.isLoading} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Degree</label>
                                        <input type="text" name="degree" value={editForm.degree} onChange={handleEditFormChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required disabled={editMutation.isLoading} />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={handleEditModalClose} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-base">Cancel</button>
                                    <button type="submit" disabled={editMutation.isLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base disabled:opacity-60 disabled:cursor-not-allowed">
                                        {editMutation.isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showReviewModal && reviewApp && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 animate-slideUp"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <button
                                onClick={handleReviewModalClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors focus:outline-none"
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Experience</h3>
                                <p className="text-gray-600 text-sm">
                                    Share your thoughts on {reviewApp.scholarshipName || reviewApp.scholarship || 'this scholarship'}.
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleReviewSubmit}>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                                        How would you rate your experience?
                                    </label>
                                    <div className="flex justify-center space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewRating(star.toString())}
                                                className={`text-4xl transition-all duration-200 hover:scale-110 ${
                                                    parseInt(reviewRating) >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                                                }`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    {reviewRating && (
                                        <p className="text-center text-sm text-gray-600 mt-2">
                                            You rated: {reviewRating} star{parseInt(reviewRating) > 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tell us about your experience
                                    </label>
                                    <textarea
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none"
                                        placeholder="Share your thoughts, feedback, or suggestions..."
                                        required
                                        rows={4}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {reviewComment.length}/500 characters
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleReviewModalClose}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={reviewMutation.isLoading || !reviewRating || !reviewComment}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {reviewMutation.isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </span>
                                        ) : (
                                            'Submit Review'
                                        )}
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

export default MyApplication;