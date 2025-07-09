import { useQuery } from "@tanstack/react-query";
import axiosSecure from "../Axios/axiosSecure";
import useAuth from "./useAuth";


const useUserRole = () => {
    const { user, loading } = useAuth();
    const { data: roleData, isLoading, error, refetch } = useQuery({
        enabled: !loading && !!user?.email,
        queryKey: ["user-role", user?.email],
        queryFn: async () => {
            // GET method, email as query param
            const res = await axiosSecure.get(`/users/role?email=${user?.email}`);
            return res.data.role;
        },
    });

    return { role: roleData, isLoading, error, refetch };
};

export default useUserRole