import React, { useState } from "react";
import axiosSecure from '../../Axios/axiosSecure';
import { FaEye, FaEdit, FaTrash, FaSpinner, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import useAuth from '../../Auth/useAuth';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const fetchScholarships = async () => {
    const res = await axiosSecure.get('/scholarship-admin');
    return res.data;
};

const ManageScholarshipAdmin = () => {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedScholarship, setSelectedScholarship] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imgError, setImgError] = useState('');
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: scholarships = [], isLoading, isError } = useQuery({
        queryKey: ['scholarships'],
        queryFn: fetchScholarships,
        enabled: !!user,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/scholarship-admin/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['scholarships']);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Scholarship deleted successfully!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        },
        onError: () => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Failed to delete scholarship!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => axiosSecure.put(`/scholarship/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['scholarships']);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Scholarship updated successfully!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            handleCloseModal();
        },
        onError: () => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Failed to update scholarship!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        }
    });

    const handleImageUpload = async (e) => {
        setImgError('');
        setUploading(true);
        const imgFile = e.target.files[0];
        if (!imgFile) {
            setImgError('No file selected');
            setUploading(false);
            return;
        }
        const formData = new FormData();
        formData.append('file', imgFile);
        formData.append('upload_preset', 'dsmr88eqz');

        try {
            const res = await axios.post(
                'https://api.cloudinary.com/v1_1/dsmr88eqz/image/upload',
                formData
            );
            setImageUrl(res.data.secure_url);
        } catch (err) {
            setImgError('Image upload failed. Try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDetails = (scholarship) => {
        setSelectedScholarship(scholarship);
        setDetailsModalOpen(true);
    };

    const handleEdit = (scholarship) => {
        setSelectedScholarship(scholarship);
        setImageUrl(scholarship.universityImage || '');
        setEditModalOpen(true);
    };

    const handleDelete = (scholarship) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(scholarship._id);
            }
        });
    };

    const handleCloseModal = () => {
        setEditModalOpen(false);
        setDetailsModalOpen(false);
        setSelectedScholarship(null);
        setImageUrl('');
        setImgError('');
    };

    const EditForm = () => {
        const { register, handleSubmit, formState: { errors }, reset } = useForm({
            defaultValues: {
                scholarshipName: selectedScholarship?.scholarshipName || '',
                universityName: selectedScholarship?.universityName || '',
                universityCountry: selectedScholarship?.universityCountry || '',
                universityCity: selectedScholarship?.universityCity || '',
                universityWorldRank: selectedScholarship?.universityWorldRank || '',
                subjectCategory: selectedScholarship?.subjectCategory || '',
                scholarshipCategory: selectedScholarship?.scholarshipCategory || '',
                degree: selectedScholarship?.degree || '',
                tuitionFees: selectedScholarship?.tuitionFees || '',
                applicationFees: selectedScholarship?.applicationFees || '',
                serviceCharge: selectedScholarship?.serviceCharge || '',
                applicationDeadline: selectedScholarship?.applicationDeadline ? new Date(selectedScholarship.applicationDeadline).toISOString().split('T')[0] : '',
                scholarshipPostDate: selectedScholarship?.scholarshipPostDate ? new Date(selectedScholarship.scholarshipPostDate).toISOString().split('T')[0] : '',
            }
        });
        
        React.useEffect(() => {
            if (selectedScholarship) {
                reset({
                    scholarshipName: selectedScholarship.scholarshipName,
                    universityName: selectedScholarship.universityName,
                    universityCountry: selectedScholarship.universityCountry,
                    universityCity: selectedScholarship.universityCity,
                    universityWorldRank: selectedScholarship.universityWorldRank,
                    subjectCategory: selectedScholarship.subjectCategory,
                    scholarshipCategory: selectedScholarship.scholarshipCategory,
                    degree: selectedScholarship.degree,
                    tuitionFees: selectedScholarship.tuitionFees,
                    applicationFees: selectedScholarship.applicationFees,
                    serviceCharge: selectedScholarship.serviceCharge,
                    applicationDeadline: selectedScholarship.applicationDeadline ? new Date(selectedScholarship.applicationDeadline).toISOString().split('T')[0] : '',
                    scholarshipPostDate: selectedScholarship.scholarshipPostDate ? new Date(selectedScholarship.scholarshipPostDate).toISOString().split('T')[0] : '',
                });
                setImageUrl(selectedScholarship.universityImage || '');
            }
        }, [selectedScholarship, reset]);

        const onSubmit = async (data) => {
            if (!imageUrl) {
                setImgError('Please upload a university image/logo.');
                return;
            }
            setImgError('');

            const updateData = {
                ...data,
                universityImage: imageUrl,
                postedUserEmail: user?.email || '',
                updatedAt: new Date().toISOString(),
            };

            updateMutation.mutate({ id: selectedScholarship._id, data: updateData });
        };

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Name</label>
                        <input type="text" {...register('scholarshipName', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        {errors.scholarshipName && <span className="text-red-500 text-xs mt-1">{errors.scholarshipName.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                        <input type="text" {...register('universityName', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        {errors.universityName && <span className="text-red-500 text-xs mt-1">{errors.universityName.message}</span>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">University Image/Logo</label>
                        <div className="flex items-center gap-4">
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200" />
                            {uploading && <FaSpinner className="text-blue-500 animate-spin text-xl" />}
                            {imageUrl && !uploading && <FaCheckCircle className="text-green-500 text-xl" />}
                            {imgError && <FaTimesCircle className="text-red-500 text-xl" />}
                        </div>
                        {imgError && <span className="text-red-500 text-xs mt-1">{imgError}</span>}
                        {imageUrl && <img src={imageUrl} alt="Preview" className="w-24 h-24 mt-2 object-cover rounded-md shadow-sm" />}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">University Country</label>
                        <input type="text" {...register('universityCountry', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        {errors.universityCountry && <span className="text-red-500 text-xs mt-1">{errors.universityCountry.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">University City</label>
                        <input type="text" {...register('universityCity', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        {errors.universityCity && <span className="text-red-500 text-xs mt-1">{errors.universityCity.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">University World Rank</label>
                        <input type="number" {...register('universityWorldRank', { required: 'Required', min: 1 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        {errors.universityWorldRank && <span className="text-red-500 text-xs mt-1">{errors.universityWorldRank.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Category</label>
                        <select {...register('subjectCategory', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <option value="">Select</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Doctor">Doctor</option>
                        </select>
                        {errors.subjectCategory && <span className="text-red-500 text-xs mt-1">{errors.subjectCategory.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Category</label>
                        <select {...register('scholarshipCategory', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <option value="">Select</option>
                            <option value="Full fund">Full fund</option>
                            <option value="Partial">Partial</option>
                            <option value="Self-fund">Self-fund</option>
                        </select>
                        {errors.scholarshipCategory && <span className="text-red-500 text-xs mt-1">{errors.scholarshipCategory.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <select {...register('degree', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <option value="">Select</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="Masters">Masters</option>
                        </select>
                        {errors.degree && <span className="text-red-500 text-xs mt-1">{errors.degree.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fees (optional)</label>
                        <input type="number" {...register('tuitionFees')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Application Fees</label>
                        <input type="number" {...register('applicationFees', { required: 'Required', min: 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        {errors.applicationFees && <span className="text-red-500 text-xs mt-1">{errors.applicationFees.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge</label>
                        <input type="number" {...register('serviceCharge', { required: 'Required', min: 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        {errors.serviceCharge && <span className="text-red-500 text-xs mt-1">{errors.serviceCharge.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                        <input type="date" {...register('applicationDeadline', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        {errors.applicationDeadline && <span className="text-red-500 text-xs mt-1">{errors.applicationDeadline.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Post Date</label>
                        <input type="date" {...register('scholarshipPostDate', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        {errors.scholarshipPostDate && <span className="text-red-500 text-xs mt-1">{errors.scholarshipPostDate.message}</span>}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200">
                        Update Scholarship
                    </button>
                    <button type="button" onClick={handleCloseModal} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200">
                        Cancel
                    </button>
                </div>
            </form>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <FaSpinner className="text-blue-500 animate-spin text-4xl" />
                <span className="ml-4 text-gray-700 font-semibold text-lg">Loading scholarships...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-red-500 text-center font-semibold text-lg">Failed to load scholarships. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-gray-100 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
                <h2 className="text-3xl font-bold p-6 text-blue-700 border-b-2 border-blue-500">
                    Manage Scholarships
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Scholarship</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">University</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Subject</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Category</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Fees</th>
                                <th className="py-4 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {scholarships.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-lg text-gray-500">
                                        No scholarships found.
                                    </td>
                                </tr>
                            ) : (
                                scholarships.map((sch) => (
                                    <motion.tr
                                        key={sch._id}
                                        className="hover:bg-blue-50 transition duration-200"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <img src={sch.universityImage} alt={`${sch.universityName} logo`} className="w-12 h-12 rounded-full object-cover border border-gray-200" onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.ibb.co/2kR6YQk/default-avatar.png'; }} />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{sch.scholarshipName}</p>
                                                    <p className="text-sm text-gray-500">{sch.degree}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <p className="text-gray-700">{sch.universityName}</p>
                                            <p className="text-sm text-gray-500">{sch.universityCity}, {sch.universityCountry}</p>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap hidden md:table-cell text-gray-700">
                                            {sch.subjectCategory}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap hidden lg:table-cell">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {sch.scholarshipCategory}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-700 font-medium">
                                            ${sch.applicationFees}
                                        </td>
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center space-x-2">
                                                <motion.button
                                                    onClick={() => handleDetails(sch)}
                                                    className="p-3 text-blue-600 hover:bg-blue-100 rounded-full transition-transform hover:scale-110"
                                                    title="View Details"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <FaEye />
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => handleEdit(sch)}
                                                    className="p-3 text-yellow-500 hover:bg-yellow-100 rounded-full transition-transform hover:scale-110"
                                                    title="Edit"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <FaEdit />
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => handleDelete(sch)}
                                                    className="p-3 text-red-500 hover:bg-red-100 rounded-full transition-transform hover:scale-110"
                                                    title="Delete"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <FaTrash />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Details Modal */}
            {detailsModalOpen && selectedScholarship && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6 border-b pb-2">
                            <h3 className="text-2xl font-bold text-blue-700">Scholarship Details</h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-red-500 transition-colors duration-200">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                            <div>
                                <h4 className="font-semibold text-blue-600 mb-2">General Info</h4>
                                <p><strong>Name:</strong> {selectedScholarship.scholarshipName}</p>
                                <p><strong>Category:</strong> {selectedScholarship.scholarshipCategory}</p>
                                <p><strong>Degree:</strong> {selectedScholarship.degree}</p>
                                <p><strong>Subject:</strong> {selectedScholarship.subjectCategory}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-600 mb-2">University Info</h4>
                                <p><strong>University:</strong> {selectedScholarship.universityName}</p>
                                <p><strong>Location:</strong> {selectedScholarship.universityCity}, {selectedScholarship.universityCountry}</p>
                                <p><strong>World Rank:</strong> {selectedScholarship.universityWorldRank}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="font-semibold text-blue-600 mb-2">Fees & Dates</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <p><strong>Tuition Fees:</strong> {selectedScholarship.tuitionFees || 'N/A'}</p>
                                    <p><strong>Application Fees:</strong> {selectedScholarship.applicationFees}</p>
                                    <p><strong>Service Charge:</strong> {selectedScholarship.serviceCharge}</p>
                                    <p><strong>Application Deadline:</strong> {new Date(selectedScholarship.applicationDeadline).toLocaleDateString()}</p>
                                    <p><strong>Post Date:</strong> {new Date(selectedScholarship.scholarshipPostDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                        {selectedScholarship.universityImage && (
                            <div className="mt-6 flex justify-center">
                                <img src={selectedScholarship.universityImage} alt="University" className="w-48 h-48 object-cover rounded-lg shadow-md" />
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && selectedScholarship && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6 border-b pb-2">
                            <h3 className="text-2xl font-bold text-blue-700">Edit Scholarship</h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-red-500 transition-colors duration-200">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>
                        <EditForm />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManageScholarshipAdmin;