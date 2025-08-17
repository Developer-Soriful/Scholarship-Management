import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosSecure from '../../Axios/axiosSecure';
import useAuth from '../../Auth/useAuth';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { FaUpload, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

const AddScholarshipAdmin = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imgError, setImgError] = useState('');
    const navigate = useNavigate();

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
        formData.append('upload_preset', 'dsmr88eqz'); // Replace with your preset name

        try {
            const res = await axios.post(
                'https://api.cloudinary.com/v1_1/dsmr88eqz/image/upload', // Replace with your cloud name
                formData
            );
            setImageUrl(res.data.secure_url);
            toast.success('Image uploaded successfully!');
        } catch (err) {
            setImgError('Image upload failed. Try again.');
            toast.error('Image upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data) => {
        if (!imageUrl) {
            setImgError('Please upload a university image/logo.');
            toast.error('Please upload a university image/logo.');
            return;
        }
        if (!user) {
            toast.error('Please log in to add a scholarship.');
            return;
        }
        setImgError('');
        
        const scholarshipData = {
            ...data,
            universityImage: imageUrl,
            tuitionFees: data.tuitionFees || null,
            postedUserEmail: user?.email || '',
            createdAt: new Date().toISOString(),
        };

        try {
            const res = await axiosSecure.post('/scholarship', scholarshipData);
            if (res.data.insertedId) {
                toast.success('Scholarship added successfully!');
                reset();
                setImageUrl('');
                setTimeout(() => {
                    navigate('/admindashboard/managescholarshipadmin');
                }, 1000);
            }
        } catch (err) {
            toast.error('Failed to add scholarship. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 md:p-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-700 mb-2">
                        Add a New Scholarship
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Fill in all the required details to create and publish a new scholarship listing for students to view and apply.
                    </p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Scholarship Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Name</label>
                            <input type="text" {...register('scholarshipName', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" placeholder="e.g., Global Excellence Scholarship" />
                            {errors.scholarshipName && <span className="text-red-500 text-xs mt-1">{errors.scholarshipName.message}</span>}
                        </div>
                        {/* University Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
                            <input type="text" {...register('universityName', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" placeholder="e.g., University of Oxford" />
                            {errors.universityName && <span className="text-red-500 text-xs mt-1">{errors.universityName.message}</span>}
                        </div>
                        {/* University Image */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">University Image/Logo</label>
                            <div className="flex items-center gap-4">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200" />
                                {uploading && <FaSpinner className="text-blue-500 animate-spin text-xl" />}
                                {imageUrl && !uploading && <FaCheckCircle className="text-green-500 text-xl" />}
                                {imgError && <FaTimesCircle className="text-red-500 text-xl" />}
                            </div>
                            {imgError && <span className="text-red-500 text-xs mt-1">{imgError}</span>}
                            {imageUrl && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-500 mb-2">Image Preview:</p>
                                    <img src={imageUrl} alt="University Logo" className="w-24 h-24 object-cover rounded-md shadow-sm" />
                                </div>
                            )}
                        </div>
                        {/* University Country & City */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">University Country</label>
                            <input type="text" {...register('universityCountry', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" placeholder="Country" />
                            {errors.universityCountry && <span className="text-red-500 text-xs mt-1">{errors.universityCountry.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">University City</label>
                            <input type="text" {...register('universityCity', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" placeholder="City" />
                            {errors.universityCity && <span className="text-red-500 text-xs mt-1">{errors.universityCity.message}</span>}
                        </div>
                        {/* University World Rank */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">University World Rank</label>
                            <input type="number" {...register('universityWorldRank', { required: 'Required', min: 1 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" placeholder="e.g., 5" />
                            {errors.universityWorldRank && <span className="text-red-500 text-xs mt-1">{errors.universityWorldRank.message}</span>}
                        </div>
                        {/* Subject Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Category</label>
                            <select {...register('subjectCategory', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
                                <option value="">Select a subject category</option>
                                <option value="Agriculture">Agriculture</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Doctor">Doctor</option>
                            </select>
                            {errors.subjectCategory && <span className="text-red-500 text-xs mt-1">{errors.subjectCategory.message}</span>}
                        </div>
                        {/* Scholarship Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Category</label>
                            <select {...register('scholarshipCategory', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
                                <option value="">Select a scholarship category</option>
                                <option value="Full fund">Full fund</option>
                                <option value="Partial">Partial</option>
                                <option value="Self-fund">Self-fund</option>
                            </select>
                            {errors.scholarshipCategory && <span className="text-red-500 text-xs mt-1">{errors.scholarshipCategory.message}</span>}
                        </div>
                        {/* Degree */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Degree</label>
                            <select {...register('degree', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
                                <option value="">Select a degree level</option>
                                <option value="Diploma">Diploma</option>
                                <option value="Bachelor">Bachelor</option>
                                <option value="Masters">Masters</option>
                            </select>
                            {errors.degree && <span className="text-red-500 text-xs mt-1">{errors.degree.message}</span>}
                        </div>
                        {/* Tuition Fees (optional) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tuition Fees (optional)</label>
                            <input type="number" {...register('tuitionFees')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" placeholder="Tuition Fees" />
                        </div>
                        {/* Application Fees */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Application Fees</label>
                            <input type="number" {...register('applicationFees', { required: 'Required', min: 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" placeholder="Application Fees" />
                            {errors.applicationFees && <span className="text-red-500 text-xs mt-1">{errors.applicationFees.message}</span>}
                        </div>
                        {/* Service Charge */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Charge</label>
                            <input type="number" {...register('serviceCharge', { required: 'Required', min: 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" placeholder="Service Charge" />
                            {errors.serviceCharge && <span className="text-red-500 text-xs mt-1">{errors.serviceCharge.message}</span>}
                        </div>
                        {/* Application Deadline */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Application Deadline</label>
                            <input type="date" {...register('applicationDeadline', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" />
                            {errors.applicationDeadline && <span className="text-red-500 text-xs mt-1">{errors.applicationDeadline.message}</span>}
                        </div>
                        {/* Scholarship Post Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Post Date</label>
                            <input type="date" {...register('scholarshipPostDate', { required: 'Required' })} defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors" />
                            {errors.scholarshipPostDate && <span className="text-red-500 text-xs mt-1">{errors.scholarshipPostDate.message}</span>}
                        </div>
                        {/* Posted User Email */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Posted User Email</label>
                            <input type="email" value={user?.email || ''} disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 duration-200">
                        Add Scholarship
                    </button>
                </form>
            </motion.div>
            <Toaster position="bottom-right" reverseOrder={false} />
        </div>
    );
};

export default AddScholarshipAdmin;