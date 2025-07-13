import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Pagination } from 'swiper/modules';
import TopScholarship from '../Pages/TopScholarship';
import { Link } from 'react-router';
import { FaArrowRight, FaGraduationCap, FaUsers, FaUniversity, FaAward, FaGlobe, FaCheckCircle, FaSearch, FaFileAlt, FaClock, FaStar, FaHandshake, FaEye, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import { MdSchool, MdTrendingUp, MdVerified, MdLocationOn, MdAccessTime, MdRocketLaunch } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import axiosSecure from '../Axios/axiosSecure';

const fetchAllScholarships = async () => {
    const res = await axiosSecure.get('/scholarship');
    return res.data;
};

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
    engineeringScholarships: scholarships.filter(s => s.subjectCategory === 'Engineering').length || 0,
    agricultureScholarships: scholarships.filter(s => s.subjectCategory === 'Agriculture').length || 0,
    doctorScholarships: scholarships.filter(s => s.subjectCategory === 'Doctor').length || 0,
    uniqueUniversities: new Set(scholarships.map(s => s.universityName)).size || 0,
    uniqueCountries: new Set(scholarships.map(s => s.universityCountry)).size || 0,
  };

  // Get recent scholarships
  const recentScholarships = scholarships
    .sort((a, b) => new Date(b.scholarshipPostDate) - new Date(a.scholarshipPostDate))
    .slice(0, 3);

  // Calculate average application fee
  const averageFee = scholarships.length > 0 
    ? Math.round(scholarships.reduce((sum, s) => sum + s.applicationFees, 0) / scholarships.length)
    : 0;

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

  return (
    <div className="w-full">
      {/* sliderSection/Banner section */}
      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        loop={true}
        pagination={{ dynamicBullets: true }}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        modules={[Pagination, Autoplay]}
        className="mySwiper w-full max-h-[60vh]"
      >
        <SwiperSlide>
          <img className='w-full' src="https://plus.unsplash.com/premium_photo-1683749808307-e5597ac69f1e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
        </SwiperSlide>
        <SwiperSlide>
          <img className='w-full' src="https://images.unsplash.com/photo-1539413595691-37a09a48579b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
        </SwiperSlide>
        <SwiperSlide>
          <img className='w-full' src="https://images.unsplash.com/photo-1579626747178-6b17360cbf44?q=80&w=1329&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
        </SwiperSlide>
      </Swiper>
      {/* this is for top 6 scholarship  */}
      <TopScholarship />
      {/* this is for all scholarship button regrating  */}
      <div className='my-5'>

        <Link to="/allScholarship" >
          <button className="inline-flex items-center mb-10 gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group">
            <span>View All Scholarships</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </Link>

      </div>
      
      {/* Enhanced Statistics and Features Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8 shadow-lg animate-pulse">
              <FaAward className="text-white text-3xl" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Live Platform Statistics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real-time data from our growing scholarship platform. Updated every moment.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {currentTime.toLocaleTimeString()}
            </div>
          </div>

          {/* Real-time Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <FaUniversity className="text-white text-2xl" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2 animate-pulse">
                {isLoading ? '...' : statistics.uniqueUniversities}+
              </div>
              <div className="text-sm text-gray-600 font-semibold">Universities</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2 animate-pulse">
                {isLoading ? '...' : statistics.totalScholarships}+
              </div>
              <div className="text-sm text-gray-600 font-semibold">Scholarships</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <FaGlobe className="text-white text-2xl" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2 animate-pulse">
                {isLoading ? '...' : statistics.uniqueCountries}+
              </div>
              <div className="text-sm text-gray-600 font-semibold">Countries</div>
            </div>
            
                         <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
               <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                 <FaDollarSign className="text-white text-2xl" />
               </div>
               <div className="text-3xl font-bold text-orange-600 mb-2 animate-pulse break-words">
                 ${isLoading ? '...' : averageFee.toLocaleString()}
               </div>
               <div className="text-sm text-gray-600 font-semibold">Avg. Fee</div>
             </div>
          </div>

          {/* Scholarship Categories Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-6">
                <FaAward className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Full Fund Scholarships</h3>
              <div className="text-4xl font-bold text-emerald-600 mb-2">{isLoading ? '...' : statistics.fullFundScholarships}</div>
              <p className="text-gray-600 leading-relaxed">
                Complete funding opportunities covering tuition, accommodation, and living expenses.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mb-6">
                <FaCheckCircle className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Partial Fund Scholarships</h3>
              <div className="text-4xl font-bold text-amber-600 mb-2">{isLoading ? '...' : statistics.partialFundScholarships}</div>
              <p className="text-gray-600 leading-relaxed">
                Partial funding options to help reduce your educational costs significantly.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-6">
                <FaHandshake className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Self Fund Options</h3>
              <div className="text-4xl font-bold text-red-600 mb-2">{isLoading ? '...' : statistics.selfFundScholarships}</div>
              <p className="text-gray-600 leading-relaxed">
                Self-funded opportunities with reduced fees and flexible payment options.
              </p>
            </div>
          </div>

          {/* Recent Scholarships Preview */}
          {recentScholarships.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Latest Scholarships Added</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentScholarships.map((scholarship, index) => (
                  <div key={scholarship._id || index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryBadgeColor(scholarship.scholarshipCategory)}`}>
                        {scholarship.scholarshipCategory}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(scholarship.scholarshipPostDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{scholarship.scholarshipName}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{scholarship.universityName}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="mr-1" />
                        {scholarship.universityCountry}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        ${scholarship.applicationFees}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-8 shadow-lg">
              <MdRocketLaunch className="text-white text-3xl" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Scholarship Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Follow our proven 4-step process to secure your dream scholarship.
            </p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center transition-all duration-500 transform hover:-translate-y-2 ${
                activeStep === 0 ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105' : 'hover:shadow-2xl'
              }`}>
                <div className={`w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 relative transition-all duration-300 ${
                  activeStep === 0 ? 'animate-pulse' : ''
                }`}>
                  <span className="text-white text-2xl font-bold">1</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <FaSearch className="text-white text-sm" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Search & Discover</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse through {statistics.totalScholarships}+ scholarships from {statistics.uniqueUniversities}+ universities worldwide.
                </p>
                {activeStep === 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">💡 Tip: Use filters to find scholarships matching your profile!</p>
                  </div>
                )}
              </div>
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <FaArrowRight className={`text-blue-500 text-2xl transition-all duration-300 ${activeStep === 0 ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center transition-all duration-500 transform hover:-translate-y-2 ${
                activeStep === 1 ? 'ring-4 ring-green-500 ring-opacity-50 scale-105' : 'hover:shadow-2xl'
              }`}>
                <div className={`w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 relative transition-all duration-300 ${
                  activeStep === 1 ? 'animate-pulse' : ''
                }`}>
                  <span className="text-white text-2xl font-bold">2</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <FaFileAlt className="text-white text-sm" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Review Details</h3>
                <p className="text-gray-600 leading-relaxed">
                  Read comprehensive information about eligibility, requirements, and deadlines.
                </p>
                {activeStep === 1 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-800 font-medium">📋 Check: Application fees, deadlines, and requirements!</p>
                  </div>
                )}
              </div>
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <FaArrowRight className={`text-green-500 text-2xl transition-all duration-300 ${activeStep === 1 ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center transition-all duration-500 transform hover:-translate-y-2 ${
                activeStep === 2 ? 'ring-4 ring-purple-500 ring-opacity-50 scale-105' : 'hover:shadow-2xl'
              }`}>
                <div className={`w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative transition-all duration-300 ${
                  activeStep === 2 ? 'animate-pulse' : ''
                }`}>
                  <span className="text-white text-2xl font-bold">3</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <FaClock className="text-white text-sm" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Track Progress</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor your application status and receive updates on your scholarship journey.
                </p>
                {activeStep === 2 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-sm text-purple-800 font-medium">⏰ Stay updated: Track your application status!</p>
                  </div>
                )}
              </div>
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <FaArrowRight className={`text-purple-500 text-2xl transition-all duration-300 ${activeStep === 2 ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center transition-all duration-500 transform hover:-translate-y-2 ${
                activeStep === 3 ? 'ring-4 ring-orange-500 ring-opacity-50 scale-105' : 'hover:shadow-2xl'
              }`}>
                <div className={`w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 relative transition-all duration-300 ${
                  activeStep === 3 ? 'animate-pulse' : ''
                }`}>
                  <span className="text-white text-2xl font-bold">4</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <FaStar className="text-white text-sm" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Get Selected</h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive your scholarship offer and start your academic journey with confidence.
                </p>
                {activeStep === 3 && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                    <p className="text-sm text-orange-800 font-medium">🎉 Congratulations: Your academic journey begins!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start?</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of students who have found their perfect scholarship through ScholarHub.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/allScholarship">
                  <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group">
                    <span>Browse Scholarships</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group">
                    <span>Create Account</span>
                    <FaUsers className="group-hover:scale-110 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
