import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Outlet } from "react-router";
import useUserRole from "../Auth/useUserRole";

const HomeLayout = () => {
  const { role } = useUserRole()
  console.log(role);
  
  return <>
    <header className="w-11/12 mx-auto" >
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
