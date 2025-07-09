import React from 'react';
import { Navigate, Outlet } from 'react-router';
import useAuth from '../Auth/useAuth';
import LoadingSpinner from '../Components/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className='flex justify-center items-center min-h-screen'>
      <LoadingSpinner />
    </div>;
  }
  if (!user) {
    return <Navigate to="/signin" />
  }
  return children
};

export default PrivateRoute; 