import axios from "axios";

// Create an Axios instance
const axiosSecure = axios.create({
    baseURL: "http://localhost:5000", // Change to your API base URL
    // You can add default headers here if needed
});

// Optional: Add a request interceptor for auth tokens
axiosSecure.interceptors.request.use(
    (config) => {
        // Get token from localStorage or context
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosSecure;