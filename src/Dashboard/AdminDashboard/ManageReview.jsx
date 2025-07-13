import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import LoadingSpinner from '../../Components/LoadingSpinner';
import Swal from 'sweetalert2';
import { FaStar, FaTrash, FaUser, FaUniversity, FaCalendar, FaGraduationCap } from 'react-icons/fa';
import useAuth from '../../Auth/useAuth';

const fetchReviews = async () => {
    const res = await axiosSecure.get('/scholarship-admin');
    return res.data;
};

const ManageReview = () => {
    const queryClient = useQueryClient();
    const [selectedReview, setSelectedReview] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { user } = useAuth();

    const { data: scholarships = [], isLoading } = useQuery({
        queryKey: ['scholarships'],
        queryFn: fetchReviews,
        enabled: !!user,
    });

    // Extract all ratings from scholarships
    const allRatings = scholarships.reduce((acc, scholarship) => {
        if (scholarship.ratings && Array.isArray(scholarship.ratings)) {
            // Add scholarship info to each rating
            const ratingsWithScholarshipInfo = scholarship.ratings.map(rating => ({
                ...rating,
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
            return axiosSecure.patch(`/ratings/${ratingId}`);
        },
        onSuccess: (data) => {
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
            console.error('Error response:', error?.response?.data);
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

    const handleDelete = (rating, scholarshipId) => {
        console.log('Handling delete for rating:', rating);
        console.log('Scholarship ID:', scholarshipId);
        setSelectedReview({ ...rating, scholarshipId });
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedReview) {
            deleteMutation.mutate({
                ratingId: selectedReview.reviewerEmail
            });
        }
    };

    const renderStars = (rating) => {
        const ratingValue = parseInt(rating) || parseInt(rating?.ratingPoint) || 0;
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                className={`w-4 h-4 ${index < ratingValue ? 'text-yellow-400' : 'text-gray-300'
                    }`}
            />
        ));
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="p-2 sm:p-4 md:p-8 min-h-[75vh] w-full">
            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-700 mb-2">Manage Reviews</h2>
                <p className="text-gray-600 text-sm sm:text-base">Manage scholarship reviews and feedback</p>
            </div>

            {/* Statistics Card */}
            <div className="bg-white rounded-lg shadow-md border border-red-100 p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <FaStar className="text-yellow-500 text-2xl mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Total Reviews</p>
                            <p className="text-2xl font-bold text-red-600">{allRatings.length}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Average Rating</p>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-red-600 mr-2">
                                {allRatings.length > 0
                                    ? (allRatings.reduce((sum, rating) => sum + (parseInt(rating.point) || 0), 0) / allRatings.length).toFixed(1)
                                    : '0.0'
                                }
                            </span>
                            <div className="flex">
                                {renderStars(Math.round(allRatings.length > 0
                                    ? allRatings.reduce((sum, rating) => sum + (parseInt(rating.point) || 0), 0) / allRatings.length
                                    : 0
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3-Card Grid Layout */}
            {allRatings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaStar className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</p>
                    <p className="text-gray-500">There are no reviews to display at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {allRatings.map((rating, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-4 border border-red-100 hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center flex-1">
                                    <img
                                        src={rating.reviewerPhotoURL}
                                        alt={rating.reviewerName}
                                        className="w-12 h-12 rounded-full mr-3 object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://i.ibb.co/2kR6YQk/default-avatar.png';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-sm">{rating.reviewerName || 'Reviewer Name'}</h3>
                                        <p className="text-gray-600 text-xs">{rating.reviewDate ? new Date(rating.reviewDate).toLocaleDateString() : 'Date not available'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(rating, rating.scholarshipId || rating.scholarship?._id)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Review"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="flex items-center text-xs text-gray-600">
                                    <FaUniversity className="mr-2" />
                                    <span className="font-medium">{rating.universityName || rating.reviewedUniversityName || 'University Name'}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                    <FaGraduationCap className="mr-2" />
                                    <span>{rating.subjectCategory || 'Subject Category'}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                    <FaCalendar className="mr-2" />
                                    <span>{rating.reviewDate ? new Date(rating.reviewDate).toLocaleDateString() : 'Date not available'}</span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="flex items-center mb-2">
                                    <span className="text-xs text-gray-600 mr-2">Rating:</span>
                                    <div className="flex">
                                        {renderStars(rating.rating)}
                                    </div>
                                    <span className="text-xs text-gray-500 ml-2">({parseInt(rating.rating) || parseInt(rating.ratingPoint) || 0}/5)</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    "{rating.reviewerComments || rating.comments || 'No comments available'}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-black/20 bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Review</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this review by <span className="font-semibold">{selectedReview.reviewerName || 'Unknown Reviewer'}</span>?
                                This action cannot be undone.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
                                >
                                    Delete Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReview;