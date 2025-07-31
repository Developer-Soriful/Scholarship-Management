// axiosSecure.js
import axios from "axios";
import { getIdToken } from "firebase/auth";

const axiosSecure = axios.create({
    baseURL: "https://server-side-12-1x95.onrender.com",
});

let interceptorId = null;

// This function should be called from inside a component, passing the user
export const attachAuthInterceptor = (user) => {
    // Remove previous interceptor if exists
    if (interceptorId !== null) {
        axiosSecure.interceptors.request.eject(interceptorId);
    }
    interceptorId = axiosSecure.interceptors.request.use(
        async (config) => {
            if (user) {
                const token = await getIdToken(user);
                config.headers.Authorization = `Bearer ${token}`;
                console.log("Sending token:", token);
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};

export default axiosSecure;