import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import useAuth from '../../Auth/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaTrash, FaUniversity, FaGraduationCap, FaCommentDots, FaTimesCircle, FaQuoteRight } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../Components/LoadingSpinner';

// Note: This component uses framer-motion and react-hot-toast for enhanced UI/UX.
// Please make sure you have them installed:
// npm install framer-motion react-hot-toast

const fetchReviews = async () => {
    const res = await axiosSecure.get('/scholarship-admin');
    return res.data;
};

const ManageReview = () => {
    const queryClient = useQueryClient();
    const { user, loading: authLoading } = useAuth();

    const { data: scholarships = [], isLoading, isError } = useQuery({
        queryKey: ['scholarships'],
        queryFn: fetchReviews,
        enabled: !authLoading && !!user,
    });

    const allReviews = scholarships.reduce((acc, scholarship) => {
        if (scholarship.ratings && Array.isArray(scholarship.ratings)) {
            const reviewsWithScholarshipInfo = scholarship.ratings.map(rating => ({
                ...rating,
                scholarshipId: scholarship._id,
                scholarshipName: scholarship.scholarshipName,
                universityName: scholarship.universityName,
                subjectCategory: scholarship.subjectCategory,
            }));
            return [...acc, ...reviewsWithScholarshipInfo];
        }
        return acc;
    }, []);

    const deleteMutation = useMutation({
        mutationFn: ({ scholarshipId, reviewerEmail }) => {
            return axiosSecure.patch(`/ratings/${scholarshipId}`, { reviewerEmail });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['scholarships']);
            toast.success('Review deleted successfully!', {
                duration: 2000,
                position: 'top-right',
            });
        },
        onError: (error) => {
            console.error('Delete error:', error);
            toast.error(error?.response?.data?.message || 'Failed to delete review!', {
                duration: 3000,
                position: 'top-right',
            });
        }
    });

    const handleDelete = (review) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this review. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                container: 'z-50'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate({
                    scholarshipId: review.scholarshipId,
                    reviewerEmail: review.reviewerEmail
                });
            }
        });
    };

    const renderStars = (rating) => {
        const ratingValue = parseInt(rating) || parseInt(rating?.ratingPoint) || 0;
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                className={`w-4 h-4 transition-colors ${index < ratingValue ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    if (isLoading) return <LoadingSpinner />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <FaTimesCircle className="text-red-500 text-4xl mb-4" />
                <p className="text-red-500 text-center font-semibold text-lg">Failed to load reviews. Please try again later.</p>
            </div>
        );
    }

    const totalRatings = allReviews.length;
    const averageRating = totalRatings > 0 ? (allReviews.reduce((sum, review) => sum + (parseInt(review.rating) || 0), 0) / totalRatings).toFixed(1) : '0.0';

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-red-700 mb-2">
                        Review Management
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Effortlessly manage and moderate all user reviews for scholarships.
                    </p>
                </div>

                {/* Statistics Card */}
                <div className="bg-white rounded-2xl  border border-red-100 p-6 md:p-8 mb-8 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                            <FaCommentDots className="text-red-600 text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                            <p className="text-3xl font-bold text-red-700">{totalRatings}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center">
                            <FaStar className="text-yellow-600 text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Average Rating</p>
                            <p className="text-3xl font-bold text-yellow-600">{averageRating}</p>
                        </div>
                    </div>
                </div>

                {/* Reviews Grid */}
                <AnimatePresence>
                    {totalRatings === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center py-20"
                        >
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCommentDots className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">No Reviews Found</p>
                            <p className="text-gray-500 max-w-md mx-auto">There are no reviews to display at the moment. User feedback will appear here as it's submitted.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allReviews.map((review, index) => (
                                <motion.div
                                    key={review._id || index}
                                    className="bg-white rounded-xl shadow-md p-6 border border-red-100 hover:shadow-lg transition-shadow duration-200"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={review.reviewerPhotoURL || 'https://i.ibb.co/2kR6YQk/default-avatar.png'}
                                                alt={review.reviewerName || 'Reviewer'}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-red-50"
                                            />
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-base">{review.reviewerName || 'Anonymous User'}</h3>
                                                <p className="text-xs text-gray-500">{new Date(review.reviewDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={() => handleDelete(review)}
                                            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                            title="Delete Review"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <FaTrash size={16} />
                                        </motion.button>
                                    </div>

                                    <div className="space-y-2 mb-4 text-gray-700 text-sm">
                                        <div className="flex items-center">
                                            <FaUniversity className="text-red-400 mr-2" />
                                            <span>{review.universityName || 'University Name'}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaGraduationCap className="text-red-400 mr-2" />
                                            <span>{review.scholarshipName || 'Scholarship Name'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center mb-4">
                                        <span className="text-sm font-semibold text-gray-600 mr-2">Rating:</span>
                                        <div className="flex">{renderStars(review.rating || review.ratingPoint)}</div>
                                        <span className="text-sm text-gray-500 ml-2">({review.rating || review.ratingPoint || 0}/5)</span>
                                    </div>

                                    <div className="relative bg-gray-50 rounded-lg p-4">
                                        <FaQuoteRight className="absolute top-2 right-2 text-red-200" size={24} />
                                        <p className="text-sm text-gray-800 leading-relaxed italic">
                                            "{review.reviewerComments || review.comments || 'No comments available'}"
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
            <Toaster />
        </div>
    );
};

export default ManageReview;