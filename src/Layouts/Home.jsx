import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Pagination } from 'swiper/modules';
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
    </div>
  )
}

export default Home
