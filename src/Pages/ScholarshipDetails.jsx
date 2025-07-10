import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../Axios/axiosSecure';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaEye, FaShare, FaBookmark, FaHeart, FaUniversity, FaGraduationCap, FaClock, FaUser, FaComments, FaTimes } from 'react-icons/fa';
import { MdSchool, MdPayment } from 'react-icons/md';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Swal from 'sweetalert2';
import useAuth from '../Auth/useAuth';

const fetchScholarshipDetails = async (id) => {
    const res = await axiosSecure.get(`/scholarship/${id}`);
    return res.data;
};

const ScholarshipDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const { user } = useAuth()
    const queryClient = useQueryClient();

    const { data: scholarship, isLoading, isError } = useQuery({
        queryKey: ['scholarshipDetails', id],
        queryFn: () => fetchScholarshipDetails(id),
        enabled: !!id,
    });

    // Review mutation
    const reviewMutation = useMutation({
        mutationFn: async (reviewData) => {
            const res = await axiosSecure.put(`/scholarship/${id}`, reviewData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['scholarshipDetails', id]);
            setShowReviewModal(false);
            setRating(0);
            setComment('');
            Swal.fire({
                icon: 'success',
                title: 'Review Submitted!',
                text: 'Thank you for your review. It has been successfully submitted.',
                timer: 2000,
                showConfirmButton: false,
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Review Submission Failed',
                text: error.response?.data?.message || 'Failed to submit review. Please try again.',
            });
        },
    });

    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, rating) => acc + rating.point, 0);
        return (sum / ratings.length).toFixed(1);
    };

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'Full fund':
                return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
            case 'Partial':
                return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
            case 'Self-fund':
                return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getSubjectBadgeColor = (subject) => {
        switch (subject) {
            case 'Engineering':
                return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
            case 'Agriculture':
                return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
            case 'Doctor':
                return 'bg-gradient-to-r from-purple-500 to-violet-500 text-white';
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
        }
    };

    const handleReviewSubmit = () => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please login to submit a review.',
            });
            return;
        }

        if (rating === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Rating Required',
                text: 'Please select a rating before submitting.',
            });
            return;
        }

        if (!comment.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Comment Required',
                text: 'Please write a comment before submitting.',
            });
            return;
        }

        const reviewData = {
            ratings: [
                {
                    reviewerEmail: user.email,
                    reviewerName: user.displayName || user.email,
                    reviewerPhotoURL: user.photoURL || '',
                    point: rating,
                    comments: comment.trim(),
                    reviewDate: new Date().toISOString(),
                },
                ...(scholarship.ratings || []),
            ],
        };

        reviewMutation.mutate(reviewData);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-gray-600 font-medium">Loading scholarship details...</p>
                </div>
            </div>
        );
    }

    if (isError || !scholarship) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-medium">Failed to load scholarship details.</p>
                </div>
            </div>
        );
    }

    return (
        <div className=" bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-20">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* University Image */}
                        <div className="relative">
                            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                                {scholarship.universityImage ? (
                                    <img
                                        src={scholarship.universityImage}
                                        alt={scholarship.universityName}
                                        className="w-full h-64 object-cover rounded-2xl shadow-2xl"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                        <MdSchool className="text-white text-8xl opacity-50" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scholarship Info */}
                        <div className="text-white">
                            <div className="flex items-center gap-4 mb-6">
                                <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${getCategoryBadgeColor(scholarship.scholarshipCategory)}`}>
                                    {scholarship.scholarshipCategory}
                                </span>
                                <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${getSubjectBadgeColor(scholarship.subjectCategory)}`}>
                                    {scholarship.subjectCategory}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                {scholarship.scholarshipName}
                            </h1>

                            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-blue-200">
                                {scholarship.universityName}
                            </h2>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400 text-xl" />
                                    <span className="text-xl font-bold">{calculateAverageRating(scholarship.ratings || [])}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-blue-200" />
                                    <span>{scholarship.universityCity}, {scholarship.universityCountry}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <FaComments />
                                    Write Review
                                </button>
                                <button className="flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/20">
                                    <FaShare />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${activeTab === 'details'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Scholarship Details
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${activeTab === 'reviews'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Reviews ({scholarship.ratings?.length || 0})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'details' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Scholarship Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <FaUniversity className="text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">University</div>
                                            <div className="text-lg font-bold text-gray-900">{scholarship.universityName}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <FaGraduationCap className="text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Subject</div>
                                            <div className="text-lg font-bold text-gray-900">{scholarship.subjectCategory}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                            <FaMapMarkerAlt className="text-red-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Location</div>
                                            <div className="text-lg font-bold text-gray-900">{scholarship.universityCity}, {scholarship.universityCountry}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <FaCalendarAlt className="text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Application Deadline</div>
                                            <div className="text-lg font-bold text-gray-900">{new Date(scholarship.applicationDeadline).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <FaDollarSign className="text-yellow-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Application Fee</div>
                                            <div className="text-lg font-bold text-gray-900">${scholarship.applicationFees}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <MdPayment className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Service Charge</div>
                                            <div className="text-lg font-bold text-gray-900">${scholarship.serviceCharge}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Scholarship Description */}
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Scholarship Description</h4>
                                    <p className="text-gray-600 leading-relaxed">
                                        {scholarship.scholarshipDescription || `This is a ${scholarship.scholarshipCategory.toLowerCase()} scholarship opportunity at ${scholarship.universityName} for ${scholarship.subjectCategory} students. The scholarship provides excellent opportunities for international students to pursue their academic goals.`}
                                    </p>
                                </div>

                                {/* Additional Details */}
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Post Date</div>
                                            <div className="text-lg font-bold text-gray-900">{new Date(scholarship.scholarshipPostDate).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Posted By</div>
                                            <div className="text-lg font-bold text-gray-900">{scholarship.postedUserEmail}</div>
                                        </div>
                                        {scholarship.tuitionFees && (
                                            <div>
                                                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Tuition Fees</div>
                                                <div className="text-lg font-bold text-gray-900">${scholarship.tuitionFees}</div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">World Rank</div>
                                            <div className="text-lg font-bold text-gray-900">#{scholarship.universityWorldRank}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Apply Now</h3>

                                <div className="space-y-6 mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Application Fee:</span>
                                        <span className="font-bold text-gray-900">${scholarship.applicationFees}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Service Charge:</span>
                                        <span className="font-bold text-gray-900">${scholarship.serviceCharge}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900">Total:</span>
                                            <span className="text-xl font-bold text-blue-600">${parseInt(scholarship.applicationFees) + parseInt(scholarship.serviceCharge)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    onClick={() => navigate(`/payment/${id}`)}
                                >
                                    Apply for Scholarship
                                </button>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-500">
                                        Application deadline: {new Date(scholarship.applicationDeadline).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-gray-900">Student Reviews</h3>
                            <div className="flex items-center gap-2">
                                <FaStar className="text-yellow-500" />
                                <span className="text-xl font-bold">{calculateAverageRating(scholarship.ratings || [])}</span>
                                <span className="text-gray-500">({scholarship.ratings?.length || 0} reviews)</span>
                            </div>
                        </div>

                        {scholarship.ratings && scholarship.ratings.length > 0 ? (
                            <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                spaceBetween={30}
                                slidesPerView={1}
                                navigation
                                pagination={{ clickable: true }}
                                autoplay={{ delay: 5000 }}
                                breakpoints={{
                                    640: {
                                        slidesPerView: 2,
                                    },
                                    1024: {
                                        slidesPerView: 3,
                                    },
                                }}
                                className="reviews-swiper"
                            >
                                {scholarship.ratings.map((review, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="bg-gray-50 rounded-2xl p-6 h-full">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                    <img className='w-full h-full rounded-full' src={review.reviewerPhotoURL} alt="" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{review.reviewerName || 'Anonymous'}</div>
                                                    <div className="text-sm text-gray-500">{new Date(review.reviewDate).toLocaleDateString()}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={`text-lg ${i < review.point ? 'text-yellow-500' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                                <span className="ml-2 font-semibold text-gray-900">{review.point}/5</span>
                                            </div>

                                            <p className="text-gray-600 leading-relaxed">{review.comments}</p>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <div className="text-center py-12">
                                <FaComments className="text-gray-400 text-6xl mx-auto mb-4" />
                                <h4 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
                                <p className="text-gray-600">Be the first to review this scholarship!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 backdrop-blur-2xl bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes size={24} />
                        </button>

                        {/* Modal Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaComments className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h3>
                            <p className="text-gray-600">Share your experience with this scholarship</p>
                        </div>

                        {/* Star Rating */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Your Rating</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="text-3xl transition-colors duration-200"
                                    >
                                        <FaStar
                                            className={`${star <= (hoveredRating || rating)
                                                ? 'text-yellow-500'
                                                : 'text-gray-300'
                                                } hover:text-yellow-400`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-sm text-gray-600">
                                    {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
                                </span>
                            </div>
                        </div>

                        {/* Comment Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Your Review
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about this scholarship..."
                                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleReviewSubmit}
                            disabled={reviewMutation.isPending}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                        >
                            {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScholarshipDetails;