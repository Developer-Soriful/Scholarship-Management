import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import LoadingSpinner from '../../Components/LoadingSpinner';
import Swal from 'sweetalert2';
import { FaStar, FaTrash, FaUserCircle, FaUniversity, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';
import useAuth from '../../Auth/useAuth';

// Utility function to fetch scholarship data
const fetchReviews = async () => {
    const res = await axiosSecure.get('/scholarship');
    return res.data;
};

// Custom component to render star ratings
const StarRating = ({ rating }) => {
    const ratingValue = parseInt(rating) || 0;
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
                <FaStar
                    key={index}
                    className={`w-4 h-4 ${index < ratingValue ? 'text-yellow-400' : 'text-gray-300'}`}
                />
            ))}
            <span className="text-sm font-medium text-gray-700 ml-2">{ratingValue}/5</span>
        </div>
    );
};

const AllReviews = () => {
    const queryClient = useQueryClient();
    const [selectedReview, setSelectedReview] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { user } = useAuth();

    const { data: scholarships = [], isLoading } = useQuery({
        queryKey: ['scholarships'],
        queryFn: fetchReviews,
        enabled: !!user,
    });

    const allRatings = scholarships.reduce((acc, scholarship) => {
        if (scholarship.ratings && Array.isArray(scholarship.ratings)) {
            const ratingsWithScholarshipInfo = scholarship.ratings.map(rating => ({
                ...rating,
                scholarshipId: scholarship._id, // Add scholarship ID for delete reference
                scholarshipName: scholarship.scholarshipName,
                universityName: scholarship.universityName,
                subjectCategory: scholarship.subjectCategory
            }));
            return [...acc, ...ratingsWithScholarshipInfo];
        }
        return acc;
    }, []);

    const deleteMutation = useMutation({
        mutationFn: ({ ratingId }) => {
            return axiosSecure.delete(`/ratings/${ratingId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['scholarships']);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Review deleted successfully!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            setShowDeleteModal(false);
            setSelectedReview(null);
        },
        onError: (error) => {
            console.error('Delete error:', error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Failed to delete review!',
                text: error?.response?.data?.message || 'Server error occurred',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    });

    const handleDelete = (rating) => {
        setSelectedReview(rating);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedReview) {
            deleteMutation.mutate({
                ratingId: selectedReview.reviewerEmail // Assuming reviewerEmail is unique and serves as the rating ID
            });
        }
    };

    if (isLoading) return <LoadingSpinner />;

    // Calculate statistics
    const totalReviews = allRatings.length;
    const averageRating = totalReviews > 0
        ? (allRatings.reduce((sum, rating) => sum + (parseInt(rating.rating) || 0), 0) / totalReviews).toFixed(1)
        : '0.0';

    return (
        <div className="p-4 md:p-8 lg:p-12 bg-gray-50 min-h-[75vh] w-full font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                        Manage All Reviews
                    </h2>
                    <p className="mt-2 text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
                        A comprehensive overview of all feedback and ratings for scholarships.
                    </p>
                </div>

                {/* Statistics Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-full mr-4">
                                <FaStar className="text-purple-600 text-3xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Reviews</p>
                                <p className="text-3xl font-bold text-gray-900">{totalReviews}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Average Rating</p>
                            <div className="flex items-center justify-end mt-1">
                                <span className="text-3xl font-bold text-purple-600 mr-2">{averageRating}</span>
                                <StarRating rating={Math.round(averageRating)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Grid */}
                {totalReviews === 0 ? (
                    <div className="text-center py-24 text-gray-500">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaStar className="w-10 h-10 text-purple-600" />
                        </div>
                        <p className="text-2xl font-semibold text-gray-700 mb-2">No Reviews Found</p>
                        <p className="text-lg text-gray-500">There are no reviews to display at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allRatings.map((rating) => (
                            <div key={rating.reviewerEmail} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex flex-col justify-between">
                                {/* Reviewer Info */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <img
                                            src={rating.reviewerPhotoURL || 'https://i.ibb.co/2kR6YQk/default-avatar.png'}
                                            alt={rating.reviewerName}
                                            className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-purple-200"
                                        />
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                {rating.reviewerName || 'Anonymous Reviewer'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {rating.reviewDate ? new Date(rating.reviewDate).toLocaleDateString() : 'Date not available'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(rating)}
                                        className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete Review"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>

                                {/* Scholarship Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-700">
                                        <FaUniversity className="mr-2 text-purple-500" />
                                        <span className="font-semibold text-gray-900">
                                            {rating.universityName || 'University Name'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <FaGraduationCap className="mr-2 text-purple-500" />
                                        <span>{rating.scholarshipName || 'Scholarship Name'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <FaCalendarAlt className="mr-2 text-purple-500" />
                                        <span>{rating.subjectCategory || 'Subject Category'}</span>
                                    </div>
                                </div>

                                {/* Rating and Comments */}
                                <div className="bg-gray-100 rounded-lg p-4 flex-grow flex flex-col justify-between">
                                    <div className="flex items-center mb-3">
                                        <StarRating rating={rating.rating} />
                                    </div>
                                    <p className="text-base text-gray-800 italic leading-relaxed">
                                        "{rating.reviewerComments || rating.comments || 'No comments available'}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-gray-900 bg-opacity-40 transition-opacity duration-300">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-sm w-full mx-auto transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaTrash className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Review</h3>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Are you sure you want to delete this review? This action cannot be undone.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors duration-200 text-base font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 text-base font-semibold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllReviews;