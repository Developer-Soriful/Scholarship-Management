import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import useAuth from '../Auth/useAuth';
import axiosSecure from '../Axios/axiosSecure';
import Swal from 'sweetalert2';

const SignIn = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { loginUser, user } = useAuth()
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState("");

  // Redirect to home if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = (data) => {
    setLoginError("");
    loginUser(data.email, data.password)
      .then(async () => {
        const userData = {
          email: data.email,
          last_login: new Date().toISOString()
        }
        await axiosSecure.patch(`/users/login-update`, userData)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Login successful!',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      })
      .catch(err => {
        setLoginError(err.message || 'Login failed. Please try again.');
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Login failed!',
          text: err.message || 'Please try again.',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      })
  }

  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const { googleLogin } = useAuth();

  const handleGoogleSignIn = async () => {
    setGoogleError("");
    try {
      const result = await googleLogin();
      const user = result.user;
      // Prepare user data for backend
      const userData = {
        userName: user.displayName,
        email: user.email,
        role: "user",
        created_at: new Date(),
        last_login: new Date().toISOString(),
      };
      await axiosSecure.post("/users", userData);
      navigate("/");
    } catch (err) {
      setGoogleError("Google sign in failed. Please try again.");
    }
  };
  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center">Sign In</h1>
        <p className="text-gray-500 text-center mb-6">Welcome back! Please enter your details.</p>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter your email"
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register('password', { required: 'Password is required' })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
          </div>
          {loginError && <div className="text-red-500 text-xs text-center font-semibold">{loginError}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow transition"
          >
            Sign In
          </button>
        </form>
        <div className="my-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-2 font-semibold text-gray-700 shadow hover:bg-blue-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.36 30.74 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.36 13.13 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.09a14.5 14.5 0 010-8.18l-7.98-6.2A23.97 23.97 0 000 24c0 3.77.9 7.34 2.69 10.29l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.19-5.6c-2.01 1.35-4.6 2.15-8.71 2.15-6.26 0-11.64-3.63-13.33-8.89l-7.98 6.2C6.71 42.52 14.82 48 24 48z"/></g></svg>
            Continue with Google
          </button>
          {googleError && <span className="text-red-500 text-xs">{googleError}</span>}
        </div>
        <div className="mt-6 text-center">
          <span className="text-gray-600">Don&apos;t have an account? </span>
          <Link to="/signUp" className="text-blue-600 hover:underline font-semibold">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
