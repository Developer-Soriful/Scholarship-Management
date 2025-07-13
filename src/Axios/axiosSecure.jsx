// axiosSecure.js
import axios from "axios";
import { getIdToken } from "firebase/auth";

const axiosSecure = axios.create({
    baseURL: "http://localhost:5000",
});

// This function should be called from inside a component, passing the user
export const attachAuthInterceptor = (user) => {
    axiosSecure.interceptors.request.use(
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