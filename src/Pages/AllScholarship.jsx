import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosSecure from '../Axios/axiosSecure';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaSearch, FaFilter, FaUniversity, FaAward, FaClock, FaHeart, FaBookmark, FaShare, FaArrowRight, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { MdSchool, MdLocationOn, MdAccessTime, MdVerified, MdInfoOutline } from 'react-icons/md';
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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
                return 'bg-blue-600 text-white';
            case 'Agriculture':
                return 'bg-green-600 text-white';
            case 'Doctor':
                return 'bg-purple-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    const filteredAndSortedScholarships = useMemo(() => {
        let filtered = scholarships.filter(scholarship => {
            const matchesSearch = scholarship.scholarshipName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                scholarship.universityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                scholarship.subjectCategory?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || scholarship.scholarshipCategory === selectedCategory;
            const matchesSubject = selectedSubject === 'all' || scholarship.subjectCategory === selectedSubject;
            return matchesSearch && matchesCategory && matchesSubject;
        });
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.scholarshipPostDate) - new Date(a.scholarshipPostDate));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.scholarshipPostDate) - new Date(b.scholarshipPostDate));
                break;
            case 'deadline':
                filtered.sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
                break;
            case 'rating':
                filtered.sort((a, b) => {
                    const ratingA = calculateAverageRating(a.ratings || []);
                    const ratingB = calculateAverageRating(b.ratings || []);
                    return ratingB - ratingA;
                });
                break;
            case 'fee-low':
                filtered.sort((a, b) => a.applicationFees - b.applicationFees);
                break;
            case 'fee-high':
                filtered.sort((a, b) => b.applicationFees - a.applicationFees);
                break;
            default:
                break;
        }
        return filtered;
    }, [scholarships, searchTerm, selectedCategory, selectedSubject, sortBy]);

    const totalPages = Math.ceil(filteredAndSortedScholarships.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentScholarships = filteredAndSortedScholarships.slice(startIndex, endIndex);

    React.useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, selectedSubject, sortBy]);
    const goToPage = (page) => setCurrentPage(page);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const getPageNumbers = () => Array.from({ length: totalPages }, (_, i) => i + 1);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                    <p className="text-xl text-gray-700 font-medium">Loading scholarships...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <MdInfoOutline className="text-red-500 text-5xl mx-auto mb-4" />
                    <p className="text-red-600 font-semibold text-lg">Failed to load scholarships. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-16 px-4 md:px-8 lg:px-12">
            <div className="mx-auto">
                {/* Header Section */}
                <header className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                        Find Your Scholarship 🎓
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Explore a curated list of scholarships from top universities around the globe. Use the filters to find the perfect one for your future.
                    </p>
                </header>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-3xl p-6 md:p-8 mb-12 border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        {/* Search Bar */}
                        <div className="flex-1 relative w-full">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, university, or subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>

                        {/* Sort & Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg"
                            >
                                <FaFilter />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="deadline">Deadline</option>
                                <option value="rating">Highest Rated</option>
                                <option value="fee-low">Lowest Fee</option>
                                <option value="fee-high">Highest Fee</option>
                            </select>
                        </div>
                    </div>

                    {/* Advanced Filters Dropdown */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200 transition-all duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Scholarship Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="Full fund">Full Fund</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Self-fund">Self Fund</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject Category</label>
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Subjects</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Agriculture">Agriculture</option>
                                        <option value="Doctor">Doctor</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Scholarship Cards Grid */}
                {currentScholarships.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
                        <FaUniversity className="text-gray-300 text-6xl mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">No Scholarships Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">Please adjust your search or filter criteria and try again.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {currentScholarships.map((scholarship) => (
                            <div key={scholarship._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
                                {/* University Image and Badges */}
                                <div className="relative h-48 rounded-t-2xl overflow-hidden">
                                    <img
                                        src={scholarship.universityImage || 'https://images.unsplash.com/photo-1628155985040-5b1b46a5a9c0'}
                                        alt={scholarship.universityName}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-md ${getCategoryBadgeColor(scholarship.scholarshipCategory)}`}>
                                            {scholarship.scholarshipCategory}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                                        <FaStar className="text-yellow-400 text-sm" />
                                        <span className="text-sm font-semibold text-gray-800">{calculateAverageRating(scholarship.ratings || [])}</span>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-6">
                                    <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
                                        <MdLocationOn />
                                        <span>{scholarship.universityCity}, {scholarship.universityCountry}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                                        {scholarship.scholarshipName}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{scholarship.universityName}</p>

                                    {/* Info Badges */}
                                    <div className="flex items-center space-x-2 flex-wrap mb-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getSubjectBadgeColor(scholarship.subjectCategory)}`}>
                                            {scholarship.subjectCategory}
                                        </span>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <FaDollarSign className="text-green-500 mr-1" />
                                            {scholarship.applicationFees === 0 ? 'Free' : `$${scholarship.applicationFees}`}
                                        </div>
                                    </div>

                                    {/* Deadline and Post Date */}
                                    <div className="flex justify-between items-center text-gray-500 text-sm border-t border-gray-100 pt-4 mt-2">
                                        <div className="flex items-center">
                                            <FaCalendarAlt className="mr-2" />
                                            <span>Deadline: {new Date(scholarship.applicationDeadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <Link to={`/scholarshipdetails/${scholarship._id}`} className="mt-6 block">
                                        <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2">
                                            <span>View Details</span>
                                            <FaArrowRight className="text-sm" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 space-x-2">
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaChevronLeft />
                        </button>
                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`w-10 h-10 rounded-full font-semibold transition-colors duration-200 ${currentPage === page ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllScholarship;