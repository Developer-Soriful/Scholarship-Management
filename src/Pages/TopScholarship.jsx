import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosSecure from '../Axios/axiosSecure';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaGraduationCap, FaDollarSign, FaUniversity, FaEye, FaAward, FaClock, FaHeart } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import { Link } from 'react-router';
// A reusable component for a single scholarship card
const ScholarshipCard = ({ scholarship }) => {
    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, rating) => acc + rating.point, 0);
        return (sum / ratings.length).toFixed(1);
    };

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'Full fund': return 'bg-emerald-500 text-white shadow-md';
            case 'Partial': return 'bg-amber-500 text-white shadow-md';
            case 'Self-fund': return 'bg-red-500 text-white shadow-md';
            default: return 'bg-gray-400 text-white shadow-md';
        }
    };

    const getSubjectBadgeColor = (subject) => {
        switch (subject) {
            case 'Engineering': return 'bg-blue-600 text-white';
            case 'Agriculture': return 'bg-green-600 text-white';
            case 'Doctor': return 'bg-purple-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
            {/* Card Header with Image and Overlays */}
            <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-800"></div>
                {scholarship.universityImage ? (
                    <img
                        src={scholarship.universityImage}
                        alt={scholarship.universityName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <MdSchool className="text-white text-8xl opacity-30" />
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center space-x-2 shadow-lg border border-white/20">
                    <FaStar className="text-yellow-500 text-lg" />
                    <span className="font-bold text-gray-800 text-lg">
                        {calculateAverageRating(scholarship.ratings || [])}
                    </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-xl ${getCategoryBadgeColor(scholarship.scholarshipCategory)}`}>
                        {scholarship.scholarshipCategory}
                    </span>
                </div>

                {/* University Name Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-extrabold text-2xl drop-shadow-xl line-clamp-2">
                        {scholarship.universityName}
                    </h3>
                    <div className="flex items-center text-white/90 mt-1">
                        <FaMapMarkerAlt className="text-sm mr-2" />
                        <span className="text-sm font-medium">
                            {scholarship.universityCity}, {scholarship.universityCountry}
                        </span>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6 md:p-8">
                {/* Subject and Details */}
                <div className="flex items-center justify-between mb-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getSubjectBadgeColor(scholarship.subjectCategory)}`}>
                        {scholarship.subjectCategory}
                    </span>
                    <div className="flex items-center space-x-4 text-gray-500">
                        <div className="flex items-center">
                            <FaAward className="text-base mr-2 text-indigo-500" />
                            <span className="text-sm font-medium">{scholarship.degree}</span>
                        </div>
                        <div className="flex items-center">
                            <FaDollarSign className="text-base mr-2 text-green-500" />
                            <span className="text-sm font-medium font-bold text-gray-900">${scholarship.applicationFees}</span>
                        </div>
                    </div>
                </div>
                
                {/* Dates */}
                <div className="space-y-4 text-gray-600 border-t border-gray-100 pt-6">
                    <div className="flex items-center">
                        <FaClock className="text-purple-500 mr-4 text-xl" />
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Posted Date</div>
                            <div className="text-sm font-semibold">{scholarship.scholarshipPostDate}</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FaCalendarAlt className="text-blue-500 mr-4 text-xl" />
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Application Deadline</div>
                            <div className="text-sm font-semibold text-red-500">{new Date(scholarship.applicationDeadline).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-8">
                    <Link to={`/scholarshipdetails/${scholarship._id}`} className="block">
                        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group/btn shadow-lg hover:shadow-xl transform hover:scale-105">
                            <FaEye className="group-hover/btn:scale-110 transition-transform duration-300" />
                            <span>View Details</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const fetchTopScholarships = async () => {
    const res = await axiosSecure.get('/top-scholarships');
    return res.data;
};

const TopScholarship = () => {
    const { data: scholarships = { data: [] }, isLoading, isError } = useQuery({
        queryKey: ['topScholarships'],
        queryFn: fetchTopScholarships,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-8 border-gray-200 border-t-indigo-600 animate-spin"></div>
                        <FaGraduationCap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 text-4xl animate-pulse" />
                    </div>
                    <p className="mt-6 text-gray-600 font-semibold tracking-wide">Loading top scholarships...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
                <div className="text-center bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
                    <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
                    <p className="text-red-600 font-semibold">Failed to load scholarships. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8 shadow-2xl">
                        <FaUniversity className="text-white text-4xl" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        Explore Top Scholarships
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Discover the most prestigious and highly-rated scholarship opportunities from world-class universities. Find your path to academic excellence.
                    </p>
                </div>
                
                {/* Scholarship Cards Grid */}
                {scholarships?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {scholarships.data.map((scholarship) => (
                            <ScholarshipCard key={scholarship._id} scholarship={scholarship} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md mx-auto border border-white/20">
                            <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MdSchool className="text-white text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Scholarships Available</h3>
                            <p className="text-gray-600 leading-relaxed">Check back later for new scholarship opportunities from top universities.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopScholarship;