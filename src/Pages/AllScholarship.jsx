import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosSecure from '../Axios/axiosSecure';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaEye, FaSearch, FaFilter, FaSort, FaHeart, FaShare, FaBookmark, FaUsers, FaGlobe, FaUniversity } from 'react-icons/fa';
import { MdSchool, MdTrendingUp, MdVerified, MdLocationOn, MdAccessTime } from 'react-icons/md';
import { Link } from 'react-router';

const fetchAllScholarships = async () => {
    const res = await axiosSecure.get('/scholarship');
    return res.data;
};

const AllScholarship = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    const { data: scholarships = [], isLoading, isError } = useQuery({
        queryKey: ['allScholarships'],
        queryFn: fetchAllScholarships,
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

    // Filter and sort scholarships
    const filteredAndSortedScholarships = useMemo(() => {
        let filtered = scholarships.filter(scholarship => {
            const matchesSearch = scholarship.universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                scholarship.scholarshipName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || scholarship.scholarshipCategory === selectedCategory;
            const matchesSubject = selectedSubject === 'all' || scholarship.subjectCategory === selectedSubject;

            return matchesSearch && matchesCategory && matchesSubject;
        });

        // Sort scholarships
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'rating':
                filtered.sort((a, b) => calculateAverageRating(b.ratings) - calculateAverageRating(a.ratings));
                break;
            case 'deadline':
                filtered.sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
                break;
            case 'fees':
                filtered.sort((a, b) => a.applicationFees - b.applicationFees);
                break;
            default:
                break;
        }

        return filtered;
    }, [scholarships, searchTerm, selectedCategory, selectedSubject, sortBy]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-gray-600 font-medium">Loading scholarships...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-24">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>

                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
                        <FaUniversity className="text-white text-3xl" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Discover Your Future
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
                        Explore thousands of scholarship opportunities from world-class universities and institutions
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl font-bold text-white mb-2">{scholarships.length}+</div>
                            <div className="text-white/80 text-sm">Available Scholarships</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl font-bold text-white mb-2">{scholarships.filter(s => s.scholarshipCategory === 'Full fund').length}</div>
                            <div className="text-white/80 text-sm">Full Funded</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl font-bold text-white mb-2">50+</div>
                            <div className="text-white/80 text-sm">Countries</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder="Search by university name, scholarship type, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <FaFilter className="text-lg" />
                                Advanced Filters
                            </button>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-8 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-lg shadow-lg"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="rating">Highest Rated</option>
                                <option value="deadline">Deadline Soon</option>
                                <option value="fees">Lowest Fees</option>
                            </select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-3">Scholarship Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="Full fund">Full Fund</option>
                                    <option value="Partial">Partial</option>
                                    <option value="Self-fund">Self Fund</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-3">Subject Category</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                >
                                    <option value="all">All Subjects</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Doctor">Doctor</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Stats */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <div className="text-gray-700 text-lg mb-4 md:mb-0">
                        Showing <span className="font-bold text-blue-600 text-xl">{filteredAndSortedScholarships.length}</span> of{' '}
                        <span className="font-bold text-xl">{scholarships.length}</span> scholarships
                    </div>
                    <div className="flex gap-4">
                        <span className="px-6 py-3 bg-green-100 text-green-800 rounded-full text-lg font-semibold shadow-lg">
                            Full Fund: {scholarships.filter(s => s.scholarshipCategory === 'Full fund').length}
                        </span>
                        <span className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full text-lg font-semibold shadow-lg">
                            Partial: {scholarships.filter(s => s.scholarshipCategory === 'Partial').length}
                        </span>
                    </div>
                </div>

                {/* Scholarship Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredAndSortedScholarships.map((scholarship, index) => (
                        <div key={scholarship._id || index} className="group relative">
                            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100">
                                {/* Card Header */}
                                <div className="relative h-52 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
                                    {scholarship.universityImage ? (
                                        <img
                                            src={scholarship.universityImage}
                                            alt={scholarship.universityName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <MdSchool className="text-white text-8xl opacity-20" />
                                        </div>
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                                    {/* Rating Badge */}
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center space-x-2 shadow-xl border border-white/20">
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

                                    {/* Action Buttons */}
                                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex space-x-3">
                                        <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors">
                                            <FaHeart className="text-red-500 text-lg" />
                                        </button>
                                        <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors">
                                            <FaBookmark className="text-blue-500 text-lg" />
                                        </button>
                                        <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors">
                                            <FaShare className="text-green-500 text-lg" />
                                        </button>
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
                                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Application Deadline</div>
                                            <div className="text-sm font-bold">
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
                                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Application Fee</div>
                                            <div className="text-lg font-bold text-gray-900">${scholarship.applicationFees}</div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link>
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
                {filteredAndSortedScholarships.length === 0 && (
                    <div className="text-center py-24">
                        <div className="bg-white rounded-3xl shadow-2xl p-16 max-w-lg mx-auto border border-gray-100">
                            <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-8">
                                <MdSchool className="text-white text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Scholarships Found</h3>
                            <p className="text-gray-600 leading-relaxed text-lg">Try adjusting your search criteria or filters to find more scholarships that match your requirements.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8">
                <button className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center">
                    <MdTrendingUp className="text-2xl" />
                </button>
            </div>
        </div>
    );
};

export default AllScholarship;