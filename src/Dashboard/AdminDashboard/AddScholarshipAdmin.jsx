import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosSecure from '../../Axios/axiosSecure';
import useAuth from '../../Auth/useAuth';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';

const AddScholarshipAdmin = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imgError, setImgError] = useState('');

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
      console.log(res.data.secure_url);
      
      setImageUrl(res.data.secure_url);
    } catch (err) {
      setImgError('Image upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!imageUrl) {
      setImgError('Please upload a university image/logo.');
      return;
    }
    setImgError('');
    const scholarshipData = {
      scholarshipName: data.scholarshipName,
      universityName: data.universityName,
      universityImage: imageUrl,
      universityCountry: data.universityCountry,
      universityCity: data.universityCity,
      universityWorldRank: data.universityWorldRank,
      subjectCategory: data.subjectCategory,
      scholarshipCategory: data.scholarshipCategory,
      degree: data.degree,
      tuitionFees: data.tuitionFees || null,
      applicationFees: data.applicationFees,
      serviceCharge: data.serviceCharge,
      applicationDeadline: data.applicationDeadline,
      scholarshipPostDate: data.scholarshipPostDate,
      postedUserEmail: user?.email || '',
      createdAt: new Date().toISOString(),
    };
    try {
      const res = await axiosSecure.post('/scholarship', scholarshipData);
      console.log(res);
      
      // reset();
      setImageUrl('');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Scholarship added successfully!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      setImgError('Failed to add scholarship. Try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center">Add Scholarship</h1>
        <p className="text-gray-500 text-center mb-6">Fill in the details to add a new scholarship.</p>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Name</label>
              <input type="text" {...register('scholarshipName', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Scholarship Name" />
              {errors.scholarshipName && <span className="text-red-500 text-xs">{errors.scholarshipName.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
              <input type="text" {...register('universityName', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="University Name" />
              {errors.universityName && <span className="text-red-500 text-xs">{errors.universityName.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">University Image/Logo</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {uploading && <span className="text-blue-500 text-xs">Uploading...</span>}
              {imageUrl && <span className="block text-green-600 text-xs mt-1">Image uploaded!</span>}
              {imgError && <span className="text-red-500 text-xs">{imgError}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">University Country</label>
              <input type="text" {...register('universityCountry', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Country" />
              {errors.universityCountry && <span className="text-red-500 text-xs">{errors.universityCountry.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">University City</label>
              <input type="text" {...register('universityCity', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="City" />
              {errors.universityCity && <span className="text-red-500 text-xs">{errors.universityCity.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">University World Rank</label>
              <input type="number" {...register('universityWorldRank', { required: 'Required', min: 1 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="World Rank" />
              {errors.universityWorldRank && <span className="text-red-500 text-xs">{errors.universityWorldRank.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Category</label>
              <select {...register('subjectCategory', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Engineering">Engineering</option>
                <option value="Doctor">Doctor</option>
              </select>
              {errors.subjectCategory && <span className="text-red-500 text-xs">{errors.subjectCategory.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Category</label>
              <select {...register('scholarshipCategory', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select</option>
                <option value="Full fund">Full fund</option>
                <option value="Partial">Partial</option>
                <option value="Self-fund">Self-fund</option>
              </select>
              {errors.scholarshipCategory && <span className="text-red-500 text-xs">{errors.scholarshipCategory.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Degree</label>
              <select {...register('degree', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Masters">Masters</option>
              </select>
              {errors.degree && <span className="text-red-500 text-xs">{errors.degree.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tuition Fees (optional)</label>
              <input type="number" {...register('tuitionFees')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Tuition Fees" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Application Fees</label>
              <input type="number" {...register('applicationFees', { required: 'Required', min: 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Application Fees" />
              {errors.applicationFees && <span className="text-red-500 text-xs">{errors.applicationFees.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Service Charge</label>
              <input type="number" {...register('serviceCharge', { required: 'Required', min: 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Service Charge" />
              {errors.serviceCharge && <span className="text-red-500 text-xs">{errors.serviceCharge.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Application Deadline</label>
              <input type="date" {...register('applicationDeadline', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              {errors.applicationDeadline && <span className="text-red-500 text-xs">{errors.applicationDeadline.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Post Date</label>
              <input type="date" {...register('scholarshipPostDate', { required: 'Required' })} defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              {errors.scholarshipPostDate && <span className="text-red-500 text-xs">{errors.scholarshipPostDate.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Posted User Email</label>
              <input type="email" value={user?.email || ''} disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow transition">Add Scholarship</button>
        </form>
      </div>
    </div>
  );
};

export default AddScholarshipAdmin;
