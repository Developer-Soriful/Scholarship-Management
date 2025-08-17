import { useState, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import TopScholarship from '../Pages/TopScholarship';
import { Link } from 'react-router';
import {
    FaArrowRight,
    FaGraduationCap,
    FaUniversity,
    FaAward,
    FaGlobe,
    FaCheckCircle,
    FaSearch,
    FaFileAlt,
    FaClock,
    FaStar,
    FaDollarSign,
    FaMapMarkerAlt,
    FaUsers,
    FaEye
} from 'react-icons/fa';
import { MdRocketLaunch } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import axiosSecure from '../Axios/axiosSecure';

const fetchAllScholarships = async () => {
    const res = await axiosSecure.get('/scholarship');
    return res.data;
};

// Reusable component for displaying recent scholarship cards
const RecentScholarshipCard = ({ scholarship, getCategoryBadgeColor }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryBadgeColor(scholarship.scholarshipCategory)}`}>
                {scholarship.scholarshipCategory}
            </span>
            <span className="text-xs text-gray-500 font-medium">
                {new Date(scholarship.scholarshipPostDate).toLocaleDateString()}
            </span>
        </div>
        <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{scholarship.scholarshipName}</h4>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{scholarship.universityName}</p>
        <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
                <FaMapMarkerAlt className="mr-1 text-blue-500" />
                {scholarship.universityCountry}
            </div>
            <div className="text-lg font-bold text-gray-900">
                ${scholarship.applicationFees}
            </div>
        </div>
        <div className="mt-4">
            <Link to={`/scholarshipdetails/${scholarship._id}`} className="block">
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700 transition-colors duration-300">
                    <FaEye /> View
                </button>
            </Link>
        </div>
    </div>
);

const Home = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeStep, setActiveStep] = useState(0);

    const { data: scholarships = [], isLoading } = useQuery({
        queryKey: ['allScholarships'],
        queryFn: fetchAllScholarships,
    });

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-rotate through steps
    useEffect(() => {
        const stepTimer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(stepTimer);
    }, []);

    // Calculate real statistics
    const statistics = {
        totalScholarships: scholarships.length || 0,
        fullFundScholarships: scholarships.filter(s => s.scholarshipCategory === 'Full fund').length || 0,
        partialFundScholarships: scholarships.filter(s => s.scholarshipCategory === 'Partial').length || 0,
        selfFundScholarships: scholarships.filter(s => s.scholarshipCategory === 'Self-fund').length || 0,
        uniqueUniversities: new Set(scholarships.map(s => s.universityName)).size || 0,
        uniqueCountries: new Set(scholarships.map(s => s.universityCountry)).size || 0,
    };

    // Get recent scholarships
    const recentScholarships = scholarships
        .sort((a, b) => new Date(b.scholarshipPostDate) - new Date(a.scholarshipPostDate))
        .slice(0, 3);

    // Calculate average application fee
    const averageFee = scholarships.length > 0
        ? Math.round(scholarships.reduce((sum, s) => sum + (s.applicationFees || 0), 0) / scholarships.length)
        : 0;

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'Full fund': return 'bg-emerald-500 text-white shadow-md';
            case 'Partial': return 'bg-amber-500 text-white shadow-md';
            case 'Self-fund': return 'bg-red-500 text-white shadow-md';
            default: return 'bg-gray-400 text-white shadow-md';
        }
    };

    return (
        <div className="w-full font-sans">
            {/* Hero Section */}
            <header className="relative w-full h-[70vh] flex items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1579626747178-6b17360cbf44?q=80&w=1329&auto=format&fit=crop&ixlib=rb-4.1.0"
                        alt="Hero background image with students"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                </div>
                <div className="relative z-10 p-6 max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 animate-fadeInUp">
                        Unlock Your Academic Future
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-8 animate-fadeInUp delay-200">
                        Discover top-rated scholarships and get a head start on your journey to a world-class education.
                    </p>
                    <Link to="/allScholarship" className="inline-block animate-fadeInUp delay-400">
                        <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 group">
                            <span>Explore Scholarships</span>
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </Link>
                </div>
            </header>

            {/* Top Scholarships Section */}
            <TopScholarship />

            {/* All Scholarships CTA */}
            <div className="my-10 text-center">
                <Link to="/allScholarship" className="inline-block">
                    <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group">
                        <span>View All Scholarships</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </Link>
            </div>

            {/* --- */}

            {/* Enhanced Statistics and Features Section */}
            <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12 lg:mb-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-xl animate-pulse">
                            <FaAward className="text-white text-3xl" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Live Platform Statistics
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                            Real-time data from our growing scholarship platform, updated every second.
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                            Last updated: {currentTime.toLocaleTimeString()}
                        </div>
                    </div>

                    {/* Real-time Statistics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaUniversity className="text-blue-600 text-2xl animate-bounce" />
                            </div>
                            <div className="text-3xl font-bold text-blue-600 mb-1">{isLoading ? '...' : statistics.uniqueUniversities}+</div>
                            <div className="text-sm font-semibold text-gray-600">Universities</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaGraduationCap className="text-green-600 text-2xl animate-bounce" />
                            </div>
                            <div className="text-3xl font-bold text-green-600 mb-1">{isLoading ? '...' : statistics.totalScholarships}+</div>
                            <div className="text-sm font-semibold text-gray-600">Scholarships</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaGlobe className="text-purple-600 text-2xl animate-bounce" />
                            </div>
                            <div className="text-3xl font-bold text-purple-600 mb-1">{isLoading ? '...' : statistics.uniqueCountries}+</div>
                            <div className="text-sm font-semibold text-gray-600">Countries</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaDollarSign className="text-orange-600 text-2xl animate-bounce" />
                            </div>
                            <div className="text-3xl font-bold text-orange-600 mb-1">
                                {isLoading ? '...' : `$${averageFee.toString().slice(0, 10)}`}
                            </div>
                            <div className="text-sm font-semibold text-gray-600">Avg. Application Fee</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- */}

            {/* How It Works Section */}
            <section className="bg-gray-50 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12 lg:mb-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4 shadow-xl">
                            <MdRocketLaunch className="text-white text-3xl" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Your Scholarship Journey
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                            Follow our simple 4-step process to secure your dream scholarship.
                        </p>
                    </div>

                    {/* Interactive Steps Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Step 1 */}
                        <div className={`relative p-8 rounded-3xl shadow-xl transition-all duration-500 transform ${activeStep === 0 ? 'bg-blue-100 scale-105 ring-4 ring-blue-500' : 'bg-white'}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${activeStep === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                <FaSearch className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-center">1. Search & Discover</h3>
                            <p className="text-sm text-gray-600 text-center">
                                Browse through {statistics.totalScholarships}+ scholarships from {statistics.uniqueUniversities}+ universities worldwide.
                            </p>
                        </div>
                        {/* Step 2 */}
                        <div className={`relative p-8 rounded-3xl shadow-xl transition-all duration-500 transform ${activeStep === 1 ? 'bg-green-100 scale-105 ring-4 ring-green-500' : 'bg-white'}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${activeStep === 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                <FaFileAlt className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-center">2. Review Details</h3>
                            <p className="text-sm text-gray-600 text-center">
                                Read comprehensive information about eligibility, requirements, and deadlines.
                            </p>
                        </div>
                        {/* Step 3 */}
                        <div className={`relative p-8 rounded-3xl shadow-xl transition-all duration-500 transform ${activeStep === 2 ? 'bg-purple-100 scale-105 ring-4 ring-purple-500' : 'bg-white'}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${activeStep === 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                <FaClock className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-center">3. Track Progress</h3>
                            <p className="text-sm text-gray-600 text-center">
                                Monitor your application status and receive updates on your scholarship journey.
                            </p>
                        </div>
                        {/* Step 4 */}
                        <div className={`relative p-8 rounded-3xl shadow-xl transition-all duration-500 transform ${activeStep === 3 ? 'bg-orange-100 scale-105 ring-4 ring-orange-500' : 'bg-white'}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${activeStep === 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                <FaStar className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-center">4. Get Selected</h3>
                            <p className="text-sm text-gray-600 text-center">
                                Receive your scholarship offer and start your academic journey with confidence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- */}

            {/* CTA Section */}
            <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Ready to Begin Your Future?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Join thousands of students who have found their perfect scholarship and started their academic journey with confidence.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/allScholarship">
                            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group">
                                <span>Find Your Scholarship</span>
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group">
                                <span>Create an Account</span>
                                <FaUsers className="group-hover:scale-110 transition-transform duration-300" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;