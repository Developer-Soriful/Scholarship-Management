import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import useAuth from '../../Auth/useAuth';
import Swal from 'sweetalert2';
import { FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../../Components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const MyReview = () => {
    const { user, loading } = useAuth();
    const queryClient = useQueryClient();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editReview, setEditReview] = useState(null);
    const [editRating, setEditRating] = useState('');
    const [editComment, setEditComment] = useState('');

    const { data: reviews = [], isLoading, refetch } = useQuery({
        queryKey: ['my-reviewOfScholarship', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/reviewOfScholarship?email=${user.email}`);
            return res.data.data || [];
        },
        enabled: !!user?.email,
    });

    const editMutation = useMutation({
        mutationFn: async ({ _id, rating, comment, reviewerEmail }) => {
            return axiosSecure.patch(`/updateReviews/${_id}`, { rating, comment, reviewerEmail });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['my-reviewOfScholarship', user?.email]);
            setEditModalOpen(false);
            setEditReview(null);
            setEditRating('');
            setEditComment('');
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Review updated successfully!',
                showConfirmButton: false,
                timer: 1500,
            });
        },
        onError: (err) => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Update failed',
                text: err?.response?.data?.message || err.message,
                showConfirmButton: false,
                timer: 2000,
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (_id) => {
            return axiosSecure.delete(`/deleteReview/${_id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['my-reviewOfScholarship', user?.email]);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Review deleted successfully!',
                showConfirmButton: false,
                timer: 1500,
            });
        },
        onError: (err) => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Delete failed',
                text: err?.response?.data?.message || err.message,
                showConfirmButton: false,
                timer: 2000,
            });
        },
    });

    const handleEdit = (review) => {
        setEditReview(review);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setEditReview(null);
        setEditRating('');
        setEditComment('');
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editReview || !editRating || !editComment) return;
        editMutation.mutate({
            _id: editReview._id,
            rating: editRating,
            comment: editComment,
            reviewerEmail: user.email
        });
    };

    const handleDelete = (_id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You cannot undo this action!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(_id);
            }
        });
    };

    const renderStars = (rating) => (
        <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
        </div>
    );

    if (loading || isLoading) {
        return <div className="flex justify-center items-center min-h-[75vh]"><LoadingSpinner /></div>;
    }

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 min-h-[75vh] w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl md:text-4xl font-extrabold text-blue-800">My Reviews</h1>
                <button
                    onClick={() => refetch()}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105 flex items-center gap-2 font-semibold text-sm w-full sm:w-auto"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                    Refresh Reviews
                </button>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-blue-100">
                    <p className="text-gray-500 text-lg">You haven't submitted any reviews yet.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto rounded-2xl shadow-xl bg-white border border-blue-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Scholarship Name</th>
                                    <th className="px-6 py-4 text-left font-semibold">University</th>
                                    <th className="px-6 py-4 text-center font-semibold">Rating</th>
                                    <th className="px-6 py-4 text-left font-semibold">Comment</th>
                                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <AnimatePresence>
                                    {reviews.map((review, index) => (
                                        <motion.tr
                                            key={review._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="hover:bg-blue-50 transition"
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">{review.scholarshipName || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-700">{review.universityName || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">{renderStars(review.rating)}</div>
                                            </td>
                                            <td className="px-6 py-4 max-w-sm truncate text-gray-600">{review.comment}</td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(review.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        className="p-2 text-yellow-500 rounded-full hover:bg-yellow-100 transition-colors"
                                                        onClick={() => handleEdit(review)}
                                                        disabled={editMutation.isLoading}
                                                        title="Edit Review"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                                                        onClick={() => handleDelete(review._id)}
                                                        disabled={deleteMutation.isLoading}
                                                        title="Delete Review"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Tablet Cards */}
                    <div className="lg:hidden space-y-4">
                        <AnimatePresence>
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={review._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-white rounded-2xl shadow-xl border border-blue-100 p-5 space-y-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                {review.scholarshipName || 'N/A'}
                                            </h3>
                                            <p className="text-gray-600 text-sm italic">{review.universityName || 'N/A'}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition"
                                                onClick={() => handleEdit(review)}
                                                disabled={editMutation.isLoading}
                                                title="Edit Review"
                                            >
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                                                onClick={() => handleDelete(review._id)}
                                                disabled={deleteMutation.isLoading}
                                                title="Delete Review"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-700">Rating:</span>
                                            {renderStars(review.rating)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">Comment:</p>
                                            <p className="text-sm text-gray-800 leading-relaxed mt-1">{review.comment}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="font-semibold">Date:</span>
                                            <span>{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editModalOpen && editReview && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleEditModalClose}></div>
                        <motion.div
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-blue-100 max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        >
                            <button
                                onClick={handleEditModalClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="Close"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                            <div className="text-center mb-6">
                                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">Edit Review</h3>
                                <p className="text-gray-600 text-sm md:text-base">
                                    Update your review for **{editReview.scholarshipName}**
                                </p>
                            </div>
                            <form className="space-y-6" onSubmit={handleEditSubmit}>
                                {/* Star Rating */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                                        How would you rate it?
                                    </label>
                                    <div className="flex justify-center space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                onClick={() => setEditRating(star.toString())}
                                                className={`text-3xl md:text-4xl transition-all duration-200 ${parseInt(editRating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                ★
                                            </motion.button>
                                        ))}
                                    </div>
                                    {editRating && (
                                        <p className="text-center text-sm text-gray-600 mt-2">
                                            Your rating: <span className="font-medium text-blue-600">{editRating} out of 5</span>
                                        </p>
                                    )}
                                </div>
                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Comment
                                    </label>
                                    <textarea
                                        value={editComment}
                                        onChange={e => setEditComment(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                                        placeholder="Share your thoughts here..."
                                        required
                                        rows={5}
                                    />
                                </div>
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleEditModalClose}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editMutation.isLoading || !editRating || !editComment}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editMutation.isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : (
                                            'Save Changes'
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

export default MyReview;