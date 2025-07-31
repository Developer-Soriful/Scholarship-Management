import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import LoadingSpinner from '../../Components/LoadingSpinner';
import Swal from 'sweetalert2';
import useAuth from '../../Auth/useAuth';


const roleOptions = ['user', 'moderator', 'admin'];

const fetchUsers = async () => {
    const res = await axiosSecure.get('/users');
    return res.data;
};

const ManageUser = () => {
    const queryClient = useQueryClient();
    const [roleChange, setRoleChange] = useState([])
    const { user, loading } = useAuth();
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        enabled: !loading && !!user,
    });
    const handleUpdateRole = async (user) => {
        if (!user || !roleChange) {
            Swal.fire({
                icon: 'error',
                title: 'Please select a role first',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
            return;
        }
        const updateData = {
            email: user.email,
            role: roleChange
        }
        const update = await axiosSecure.patch(`/users/${user._id}`, updateData)
        if (update) {
            Swal.fire({
                icon: 'success',
                title: 'User updated successfully!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
        }
    }

    // Delete user with confirmation dialog
    const handleDelete = async (userId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        });
        if (result.isConfirmed) {
            try {
                const res = await axiosSecure.delete(`/userDelete/${userId}`);
                if (res && res.data && (res.data.deletedCount === 1 || res.data.success)) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Successfully deleted this user',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Delete unsuccessful',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Delete unsuccessful',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                });
            }
            queryClient.invalidateQueries(['users']);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-teal-700">Manage Users</h2>
            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white">
                    <thead className="bg-teal-600 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">Email</th>
                            <th className="py-3 px-4 text-left">Role</th>
                            <th className="py-3 px-4 text-left">Created At</th>
                            <th className="py-3 px-4 text-left">Last Login</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="border-b hover:bg-teal-50 transition">
                                <td className="py-2 px-4 font-medium">{user.userName}</td>
                                <td className="py-2 px-4">{user.email}</td>
                                <td className="py-2 px-4">
                                    <select
                                        className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                        value={roleChange[user._id] || user.role}
                                        onChange={(e) => setRoleChange(e.target.value)}
                                    >
                                        {roleOptions.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    <button
                                        className="ml-2 px-3 py-1 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700 transition disabled:opacity-50"
                                        onClick={() => handleUpdateRole(user)}
                                    >
                                        Update
                                    </button>
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleString()}</td>
                                <td className="py-2 px-4 text-sm text-gray-500">{new Date(user.last_login).toLocaleString()}</td>
                                <td className="py-2 px-4 text-center">
                                    <button
                                        className="px-3 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
                                        onClick={() => handleDelete(user._id)}
                                    >
                                        delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-400">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default ManageUser;
