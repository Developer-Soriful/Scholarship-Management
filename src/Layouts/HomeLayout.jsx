import React, { useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Outlet } from "react-router";
import useUserRole from "../Auth/useUserRole";
import useAuth from "../Auth/useAuth";
import { attachAuthInterceptor } from "../Axios/axiosSecure";

const HomeLayout = () => {
  const { user } = useAuth()
  useEffect(() => {
    if (user) {
      attachAuthInterceptor(user);
    }
  }, [user]);
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
