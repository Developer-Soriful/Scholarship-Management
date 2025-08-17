import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

// This code is designed to work as a self-contained application.
// Since external files are not available here, we will use some mock data.

// Mock user data
const mockUser = {
    email: 'admin@example.com',
};

// Mock authentication hook
const useAuth = () => ({
    user: mockUser,
});

// Mock navigate function
const useNavigate = () => {
    return (path) => {
        console.log(`Navigating to ${path}`);
    };
};

const AddScholarship = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    // Image upload functionality
    const handleImageUpload = async (e) => {
        setStatusMessage('');
        const imgFile = e.target.files[0];
        if (!imgFile) {
            setStatusMessage('No file selected.');
            return;
        }

        setUploading(true);
        // This is a mock upload function to work as a demo.
        // In a real project, you would use your Cloudinary or other service.
        try {
            // Simulating a mock upload instead of a Cloudinary API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockUrl = URL.createObjectURL(imgFile);
            setImageUrl(mockUrl);
            setStatusMessage('Image uploaded successfully!');
            setIsSuccess(true);
        } catch (err) {
            setStatusMessage('Image upload failed. Please try again.');
            setIsSuccess(false);
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data) => {
        if (!imageUrl) {
            setStatusMessage('Please upload a university image/logo.');
            setIsSuccess(false);
            return;
        }
        if (!user) {
            setStatusMessage('Please log in first to add a scholarship.');
            setIsSuccess(false);
            return;
        }
        setStatusMessage('');

        const scholarshipData = {
            scholarshipName: data.scholarshipName,
            universityName: data.universityName,
            universityImage: imageUrl,
            universityCountry: data.universityCountry,
            universityCity: data.universityCity,
            universityWorldRank: parseInt(data.universityWorldRank),
            subjectCategory: data.subjectCategory,
            scholarshipCategory: data.scholarshipCategory,
            degree: data.degree,
            tuitionFees: data.tuitionFees ? parseInt(data.tuitionFees) : null,
            applicationFees: parseInt(data.applicationFees),
            serviceCharge: parseInt(data.serviceCharge),
            applicationDeadline: data.applicationDeadline,
            scholarshipPostDate: data.scholarshipPostDate,
            postedUserEmail: user?.email || '',
            createdAt: new Date().toISOString(),
        };

        try {
            // This is a mock API call. Use your real API endpoint.
            // const res = await axiosSecure.post('/scholarship', scholarshipData);
            console.log('Scholarship data to be submitted:', scholarshipData);

            // Simulated successful response
            const res = { status: 201 };

            if (res.status === 201) {
                setStatusMessage('Scholarship added successfully!');
                setIsSuccess(true);
                reset();
                setImageUrl('');
                navigate('/moderatorDashboard/manageScholarship');
            } else {
                throw new Error('Unexpected response from server.');
            }
        } catch (err) {
            setStatusMessage('Failed to add scholarship. Please try again.');
            setIsSuccess(false);
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center w-full p-4 font-sans">
            <div className="w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 h-full overflow-y-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-800">
                        Add a New Scholarship
                    </h1>
                    <p className="mt-2 text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
                        Fill in the details below to publish a new scholarship opportunity.
                    </p>
                </div>

                {statusMessage && (
                    <div className={`p-4 mb-6 rounded-xl text-center font-medium ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {statusMessage}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Scholarship Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Global Excellence Scholarship"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('scholarshipName', { required: 'Scholarship name is required' })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">University Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Harvard University"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('universityName', { required: 'University name is required' })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">University Country</label>
                            <input
                                type="text"
                                placeholder="e.g., United States"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('universityCountry', { required: 'Country is required' })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">University City</label>
                            <input
                                type="text"
                                placeholder="e.g., Cambridge"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('universityCity', { required: 'City is required' })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">University World Rank</label>
                            <input
                                type="number"
                                placeholder="e.g., 10"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('universityWorldRank', { required: 'Rank is required', min: { value: 1, message: 'Rank must be a positive number' } })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Subject Category</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('subjectCategory', { required: 'Subject category is required' })}
                            >
                                <option value="">Select a subject</option>
                                <option value="Agriculture">Agriculture</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Doctor">Medical</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Scholarship Type</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('scholarshipCategory', { required: 'Scholarship type is required' })}
                            >
                                <option value="">Select a type</option>
                                <option value="Full fund">Full fund</option>
                                <option value="Partial">Partial</option>
                                <option value="Self-fund">Self-fund</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Degree</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('degree', { required: 'Degree is required' })}
                            >
                                <option value="">Select a degree</option>
                                <option value="Diploma">Diploma</option>
                                <option value="Bachelor">Bachelor</option>
                                <option value="Masters">Masters</option>
                            </select>
                        </div>
                    </div>

                    {/* Fees and Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Tuition Fees (Optional)</label>
                            <input
                                type="number"
                                placeholder="e.g., 10000"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('tuitionFees')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Application Fees</label>
                            <input
                                type="number"
                                placeholder="e.g., 50"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('applicationFees', { required: 'Application fee is required', min: { value: 0, message: 'Must be 0 or more' } })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Service Charge</label>
                            <input
                                type="number"
                                placeholder="e.g., 20"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('serviceCharge', { required: 'Service charge is required', min: { value: 0, message: 'Must be 0 or more' } })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Application Deadline</label>
                            <input
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('applicationDeadline', { required: 'Deadline is required' })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Scholarship Post Date</label>
                            <input
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                {...register('scholarshipPostDate', { required: 'Post date is required' })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Posted User</label>
                            <input
                                type="email"
                                value={user?.email || 'N/A'}
                                disabled
                                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            University Image/Logo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center transition-all duration-200 hover:border-purple-400 cursor-pointer"
                        />
                        {uploading && <p className="text-sm text-center text-purple-600">Uploading...</p>}
                        {imageUrl && (
                            <div className="text-center mt-2">
                                <img src={imageUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover mx-auto border" />
                            </div>
                        )}
                    </div>

                    {/* Form Errors and Submit Button */}
                    <div className="mt-8">
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
                                <p className="font-semibold mb-1">Please fix the following errors:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index}>{error.message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button
                            type="submit"
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200
                                ${uploading || !imageUrl ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}
                            `}
                            disabled={uploading || !imageUrl}
                        >
                            {uploading ? 'Image is uploading...' : 'Add Scholarship'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddScholarship;
