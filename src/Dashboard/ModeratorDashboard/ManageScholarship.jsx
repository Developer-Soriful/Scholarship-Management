import React, { useState } from "react";
import axiosSecure from '../../Axios/axiosSecure';
import { FaEye, FaEdit, FaTimes } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import useAuth from '../../Auth/useAuth';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';

const fetchScholarships = async () => {
  const res = await axiosSecure.get('/scholarship');
  return res.data;
};

const ManageScholarship = () => {
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
    mutationFn: (id) => axiosSecure.delete(`/scholarship/${id}`),
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
    const { register, handleSubmit, formState: { errors } } = useForm({
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
        applicationDeadline: selectedScholarship?.applicationDeadline || '',
        scholarshipPostDate: selectedScholarship?.scholarshipPostDate || '',
      }
    });

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Name</label>
            <input type="text" {...register('scholarshipName', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {errors.scholarshipName && <span className="text-red-500 text-xs">{errors.scholarshipName.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
            <input type="text" {...register('universityName', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {errors.universityName && <span className="text-red-500 text-xs">{errors.universityName.message}</span>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">University Image/Logo</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            {uploading && <span className="text-purple-500 text-xs">Uploading...</span>}
            {imageUrl && <span className="block text-green-600 text-xs mt-1">Image uploaded!</span>}
            {imgError && <span className="text-red-500 text-xs">{imgError}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">University Country</label>
            <input type="text" {...register('universityCountry', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {errors.universityCountry && <span className="text-red-500 text-xs">{errors.universityCountry.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">University City</label>
            <input type="text" {...register('universityCity', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {errors.universityCity && <span className="text-red-500 text-xs">{errors.universityCity.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">University World Rank</label>
            <input type="number" {...register('universityWorldRank', { required: 'Required', min: 1 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {errors.universityWorldRank && <span className="text-red-500 text-xs">{errors.universityWorldRank.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Category</label>
            <select {...register('subjectCategory', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="">Select</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Engineering">Engineering</option>
              <option value="Doctor">Doctor</option>
            </select>
            {errors.subjectCategory && <span className="text-red-500 text-xs">{errors.subjectCategory.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Category</label>
            <select {...register('scholarshipCategory', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="">Select</option>
              <option value="Full fund">Full fund</option>
              <option value="Partial">Partial</option>
              <option value="Self-fund">Self-fund</option>
            </select>
            {errors.scholarshipCategory && <span className="text-red-500 text-xs">{errors.scholarshipCategory.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Degree</label>
            <select {...register('degree', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="">Select</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Masters">Masters</option>
            </select>
            {errors.degree && <span className="text-red-500 text-xs">{errors.degree.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tuition Fees (optional)</label>
            <input type="number" {...register('tuitionFees')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Application Fees</label>
            <input type="number" {...register('applicationFees', { required: 'Required', min: 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {errors.applicationFees && <span className="text-red-500 text-xs">{errors.applicationFees.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Charge</label>
            <input type="number" {...register('serviceCharge', { required: 'Required', min: 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {errors.serviceCharge && <span className="text-red-500 text-xs">{errors.serviceCharge.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Application Deadline</label>
            <input type="date" {...register('applicationDeadline', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {errors.applicationDeadline && <span className="text-red-500 text-xs">{errors.applicationDeadline.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Post Date</label>
            <input type="date" {...register('scholarshipPostDate', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {errors.scholarshipPostDate && <span className="text-red-500 text-xs">{errors.scholarshipPostDate.message}</span>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Posted User Email</label>
            <input type="email" value={user?.email || ''} disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 sm:py-3 rounded-lg shadow transition text-sm sm:text-base">
            Update Scholarship
          </button>
          <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 sm:py-3 rounded-lg shadow transition text-sm sm:text-base">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-[75vh] w-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700 mb-2">Manage Scholarships</h2>
        <p className="text-gray-600 text-sm sm:text-base">View, edit, and manage all scholarship applications</p>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading scholarships...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            <p>Failed to load scholarships.</p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No scholarships found.</p>
          </div>
        ) : (
          scholarships.map((sch, idx) => (
            <div key={sch._id || idx} className="bg-white rounded-lg shadow-md p-4 border border-purple-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{sch.scholarshipName}</h3>
                  <p className="text-gray-600 text-xs">{sch.universityName}</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button title="Details" className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded" onClick={() => handleDetails(sch)}>
                    <FaEye size={16} />
                  </button>
                  <button title="Edit" className="p-1 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded" onClick={() => handleEdit(sch)}>
                    <FaEdit size={16} />
                  </button>
                  <button title="Delete" className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" onClick={() => handleDelete(sch)}>
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Subject:</span>
                  <p className="font-medium text-gray-900">{sch.subjectCategory}</p>
                </div>
                <div>
                  <span className="text-gray-500">Degree:</span>
                  <p className="font-medium text-gray-900">{sch.degree}</p>
                </div>
                <div>
                  <span className="text-gray-500">Fees:</span>
                  <p className="font-medium text-gray-900">${sch.applicationFees}</p>
                </div>
                <div>
                  <span className="text-gray-500">Deadline:</span>
                  <p className="font-medium text-gray-900">{new Date(sch.applicationDeadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-lg shadow-lg border border-purple-100">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700">
              <th className="py-3 px-4 text-left text-sm font-semibold">Scholarship Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">University Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Subject Category</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Degree</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Application Fees</th>
              <th className="py-3 px-4 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading scholarships...</p>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-red-500">
                  <p>Failed to load scholarships.</p>
                </td>
              </tr>
            ) : scholarships.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-500">
                  <div className="max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No Scholarships Found</p>
                    <p className="text-gray-500">There are no scholarships to display at the moment.</p>
                  </div>
                </td>
              </tr>
            ) : (
              scholarships.map((sch, idx) => (
                <tr key={sch._id || idx} className="border-b border-gray-100 hover:bg-purple-50 transition-colors duration-200">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs">{sch.scholarshipName}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-700 truncate max-w-xs">{sch.universityName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {sch.subjectCategory}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {sch.degree}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">${sch.applicationFees}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        title="View Details" 
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors duration-200" 
                        onClick={() => handleDetails(sch)}
                      >
                        <FaEye size={16} />
                      </button>
                      <button 
                        title="Edit Scholarship" 
                        className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors duration-200" 
                        onClick={() => handleEdit(sch)}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button 
                        title="Delete Scholarship" 
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200" 
                        onClick={() => handleDelete(sch)}
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {detailsModalOpen && selectedScholarship && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 hover:bg-gray-100 rounded-full transition-colors">
              <FaTimes size={20} />
            </button>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-purple-700">Scholarship Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Name</label>
                <p className="text-gray-900">{selectedScholarship.scholarshipName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
                <p className="text-gray-900">{selectedScholarship.universityName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">University Country</label>
                <p className="text-gray-900">{selectedScholarship.universityCountry}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">University City</label>
                <p className="text-gray-900">{selectedScholarship.universityCity}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">World Rank</label>
                <p className="text-gray-900">{selectedScholarship.universityWorldRank}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Category</label>
                <p className="text-gray-900">{selectedScholarship.subjectCategory}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Category</label>
                <p className="text-gray-900">{selectedScholarship.scholarshipCategory}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Degree</label>
                <p className="text-gray-900">{selectedScholarship.degree}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tuition Fees</label>
                <p className="text-gray-900">{selectedScholarship.tuitionFees || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Application Fees</label>
                <p className="text-gray-900">{selectedScholarship.applicationFees}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Service Charge</label>
                <p className="text-gray-900">{selectedScholarship.serviceCharge}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Application Deadline</label>
                <p className="text-gray-900">{selectedScholarship.applicationDeadline}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Post Date</label>
                <p className="text-gray-900">{selectedScholarship.scholarshipPostDate}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Posted By</label>
                <p className="text-gray-900">{selectedScholarship.postedUserEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Created At</label>
                <p className="text-gray-900">{selectedScholarship.createdAt ? new Date(selectedScholarship.createdAt).toLocaleString() : 'Not available'}</p>
              </div>
            </div>
            {selectedScholarship.universityImage && (
              <div className="mt-4 sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">University Image</label>
                <div className="flex justify-center">
                  <img src={selectedScholarship.universityImage} alt="University" className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg shadow-md" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedScholarship && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 hover:bg-gray-100 rounded-full transition-colors">
              <FaTimes size={20} />
            </button>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-purple-700">Edit Scholarship</h3>
            <EditForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageScholarship;
