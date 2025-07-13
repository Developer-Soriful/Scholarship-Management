import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Outlet } from "react-router";
import useUserRole from "../Auth/useUserRole";
import useAuth from "../Auth/useAuth";

const HomeLayout = () => {
  const { user, loading } = useAuth();
  const { role } = useUserRole();
  console.log('HomeLayout user:', user, 'loading:', loading);

  return <>
    <header className="w-11/12  mx-auto backdrop-blur-xl bg-white/20 shadow-lg sticky top-0 z-50 border-b border-gray-200" >
      <Navbar />
    </header>
    <main className="w-11/12 mx-auto flex justify-center items-center" style={{ minHeight: 'calc(100vh - 184.99px)' }}>
      <Outlet />
    </main>
    <footer className="w-11/12 mx-auto">
      <Footer />
    </footer>
  </>;
};

export default HomeLayout;
