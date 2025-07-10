import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Pagination } from 'swiper/modules';
import TopScholarship from '../Pages/TopScholarship';
import { Link } from 'react-router';
import { FaArrowRight, FaGraduationCap } from 'react-icons/fa';

const Home = () => {
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
      <div>

        <Link to="/allScholarship" >
          <button className="inline-flex items-center mb-10 gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group">
            <span>View All Scholarships</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </Link>

      </div>
    </div>
  )
}

export default Home
