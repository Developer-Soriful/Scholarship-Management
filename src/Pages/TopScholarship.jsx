import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosSecure from '../Axios/axiosSecure';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaGraduationCap, FaDollarSign, FaEye, FaUniversity } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import { Link } from 'react-router';

const fetchTopScholarships = async () => {
    const res = await axiosSecure.get('/scholarship');
    return res.data;
};

const TopScholarship = () => {
    const { data: scholarships = [], isLoading, isError } = useQuery({
        queryKey: ['topScholarships'],
        queryFn: fetchTopScholarships,
    });

    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, rating) => acc + rating.point, 0);
        return (sum / ratings.length).toFixed(1);
    };

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'Full fund':
                return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg';
            case 'Partial':
                return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg';
            case 'Self-fund':
                return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg';
        }
    };

    const getSubjectBadgeColor = (subject) => {
        switch (subject) {
            case 'Engineering':
                return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md';
            case 'Agriculture':
                return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md';
            case 'Doctor':
                return 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md';
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-gray-600 font-medium">Loading top scholarships...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-medium">Failed to load scholarships.</p>
                </div>
            </div>
        );
    }

    return (
        <div className=" bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
                        <FaUniversity className="text-white text-3xl" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
                        Top Scholarships
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Discover the best scholarship opportunities from world-class universities around the globe
                    </p>
                </div>

                {/* Filters and Stats */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                    <div className="flex items-center space-x-6 mb-6 md:mb-0">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{scholarships.length}</div>
                            <div className="text-sm text-gray-600">Total Scholarships</div>
                        </div>
                        <div className="h-12 w-px bg-gray-300"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {scholarships.filter(s => s.scholarshipCategory === 'Full fund').length}
                            </div>
                            <div className="text-sm text-gray-600">Full Fund</div>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg">
                            Full Fund: {scholarships.filter(s => s.scholarshipCategory === 'Full fund').length}
                        </span>
                        <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold shadow-lg">
                            Partial: {scholarships.filter(s => s.scholarshipCategory === 'Partial').length}
                        </span>
                    </div>
                </div>

                {/* Scholarship Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {scholarships.map((scholarship, index) => (
                        <div key={scholarship._id || index} className="group relative">
                            {/* Card Container */}
                            <div className="bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white/20">
                                {/* Card Header with Image */}
                                <div className="relative h-56 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
                                    {scholarship.universityImage ? (
                                        <img
                                            src={scholarship.universityImage}
                                            alt={scholarship.universityName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <MdSchool className="text-white text-8xl opacity-30" />
                                        </div>
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

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
                                        <h3 className="text-white font-bold text-xl drop-shadow-lg line-clamp-2">
                                            {scholarship.universityName}
                                        </h3>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-8">
                                    {/* Location */}
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                            <FaMapMarkerAlt className="text-red-500" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {scholarship.universityCity}, {scholarship.universityCountry}
                                        </span>
                                    </div>

                                    {/* Subject Category */}
                                    <div className="mb-6">
                                        <span className={`px-4 py-2 rounded-2xl text-sm font-bold ${getSubjectBadgeColor(scholarship.subjectCategory)}`}>
                                            {scholarship.subjectCategory}
                                        </span>
                                    </div>

                                    {/* Application Deadline */}
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <FaCalendarAlt className="text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Deadline</div>
                                            <div className="text-sm font-semibold">
                                                {new Date(scholarship.applicationDeadline).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Application Fees */}
                                    <div className="flex items-center text-gray-600 mb-8">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <FaDollarSign className="text-green-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Application Fee</div>
                                            <div className="text-lg font-bold text-gray-900">${scholarship.applicationFees}</div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link to={`/scholarshipdetails/${scholarship._id}`}>
                                        <button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 group/btn shadow-lg hover:shadow-xl transform hover:scale-105">
                                            <FaEye className="group-hover/btn:scale-110 transition-transform duration-300" />
                                            <span>View Details</span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {scholarships.length === 0 && (
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