import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import useAuth from '../../Auth/useAuth';
import Swal from 'sweetalert2';
import { FaTimes } from 'react-icons/fa';

const MyApplication = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState(null);
  const [editDegree, setEditDegree] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewApp, setReviewApp] = useState(null);
  const [reviewRating, setReviewRating] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDate, setReviewDate] = useState('');

  // Fetch user's applied scholarships
  const { data: applications = { data: [] }, isLoading, refetch } = useQuery({
    queryKey: ['my-applications', user?.email],
    queryFn: async () => {
      if (!user?.email) return { data: [] };
      const res = await axiosSecure.get(`/applied-scholarship?userEmail=${user.email}`);
      // If backend returns array, wrap in { data: ... }
      if (Array.isArray(res.data)) {
        return { data: res.data };
      }
      return res.data;
    },
    enabled: !!user?.email,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, degree, address, subjectCategory }) => {
      return axiosSecure.patch(`/applied-scholarship/${id}`, { degree, address, subjectCategory });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-applications', user?.email]);
      setEditId(null);
      setEditDegree('');
      setEditAddress('');
      setEditSubject('');
      setShowEditModal(false);
      setEditApp(null);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Application updated!',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    },
    onError: (err) => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Failed to update',
        text: err?.response?.data?.message || err.message,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    },
  });

  // Cancel/Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axiosSecure.delete(`/applied-scholarship/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-applications', user?.email]);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Application cancelled!',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    },
    onError: (err) => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Failed to cancel',
        text: err?.response?.data?.message || err.message,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    },
  });

  // Review mutation - MOVED TO TOP
  const reviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      // Adjust endpoint as needed
      return axiosSecure.put(`/MyScholarship/${reviewData.universityId}`, reviewData);
    },
    onSuccess: () => {
      setShowReviewModal(false);
      setReviewApp(null);
      setReviewRating('');
      setReviewComment('');
      setReviewDate('');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Review submitted!',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    },
    onError: (err) => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Failed to submit review',
        text: err?.response?.data?.message || err.message,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    },
  });

  const handleEdit = (app) => {
    setEditApp(app);
    setEditDegree(app.degree);
    setEditId(app._id);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditApp(null);
    setEditId(null);
    setEditDegree('');
    setEditAddress('');
    setEditSubject('');
  };

  const [editAddress, setEditAddress] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editFees, setEditFees] = useState('');
  const [editServiceCharge, setEditServiceCharge] = useState('');
  const [editStatus, setEditStatus] = useState('pending');

  // When opening modal, set all fields
  React.useEffect(() => {
    if (showEditModal && editApp) {
      setEditDegree(editApp.degree);
      setEditAddress(editApp.address);
      setEditSubject(editApp.subjectCategory);
      setEditFees(editApp.applicationFees || '');
      setEditServiceCharge(editApp.serviceCharge || '');
      setEditStatus(editApp.status || 'pending');
    }
  }, [showEditModal, editApp]);

  const handleEditConfirm = (id) => {
    if (!editDegree || !editAddress || !editSubject || !editFees || !editServiceCharge || !editStatus) return;
    editMutation.mutate({
      id,
      degree: editDegree,
      address: editAddress,
      subjectCategory: editSubject,
      applicationFees: editFees,
      serviceCharge: editServiceCharge,
      status: editStatus,
    }, {
      onSuccess: () => {
        handleEditModalClose();
      }
    });
  };

  const handleCancel = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel this application?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Cancel Application',
      cancelButtonText: 'No',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleReview = (appId) => {
    const app = applications.data?.find(a => a._id === appId);
    setReviewApp(app);
    setShowReviewModal(true);
    setReviewRating('');
    setReviewComment('');
    setReviewDate(new Date().toISOString().slice(0, 10)); // default today
  };

  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setReviewApp(null);
    setReviewRating('');
    setReviewComment('');
    setReviewDate('');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewApp || !reviewRating || !reviewComment || !reviewDate) return;
    reviewMutation.mutate({
      rating: reviewRating,
      comment: reviewComment,
      date: reviewDate,
      scholarshipName: reviewApp.scholarshipName || reviewApp.scholarship || '',
      universityName: reviewApp.university,
      universityId: reviewApp.scholarshipId || reviewApp.universityId || '',
      userName: user.displayName,
      userImage: user.photoURL || '',
      userEmail: user.email,
    });
  };

  
  if (isLoading) return <div className="text-center py-10">Loading...</div>;


  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 min-h-[75vh] w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-700">My Applications</h1>
        <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-base">Refetch</button>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-xl bg-white border border-blue-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3">University Name</th>
              <th className="px-4 py-3">University Address</th>
              <th className="px-4 py-3">Application Feedback</th>
              <th className="px-4 py-3">Subject Category</th>
              <th className="px-4 py-3">Applied Degree</th>
              <th className="px-4 py-3">Application Fees</th>
              <th className="px-4 py-3">Service Charge</th>
              <th className="px-4 py-3">Application Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.data?.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">No applications found.</td>
              </tr>
            )}
            {applications.data?.map((app) => (
              <tr key={app._id} className="hover:bg-blue-50 transition">
                <td className="px-4 py-3 font-semibold">{app.university}</td>
                <td className="px-4 py-3">{app.address}</td>
                <td className="px-4 py-3">{app.feedback || <span className="text-gray-400">-</span>}</td>
                <td className="px-4 py-3">{app.subjectCategory}</td>
                <td className="px-4 py-3">{app.degree}</td>
                <td className="px-4 py-3">${app.applicationFees || '-'}</td>
                <td className="px-4 py-3">${app.serviceCharge || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'processing' ? 'bg-blue-100 text-blue-800' : app.status === 'completed' ? 'bg-green-100 text-green-800' : app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{app.status === 'rejected' ? 'Rejected' : ''}</span>
                </td>
                <td className="px-4 py-3 space-x-2 flex items-center">
                  {/* Details Button */}
                  <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" onClick={() => Swal.fire('Details', 'Show details modal here.', 'info')}>Details</button>
                  {/* Edit Button */}
                  <button className={`px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs ${app.status !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => app.status === 'pending' && handleEdit(app)} disabled={app.status !== 'pending' || editMutation.isLoading}>Edit</button>
                  {/* Cancel Button */}
                  <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" onClick={() => handleCancel(app._id)} disabled={deleteMutation.isLoading}>Cancel</button>
                  {/* Add Review Button */}
                  <button className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs" onClick={()=> handleReview(app._id)}>Add Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && editApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/30 bg-opacity-40">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-blue-100 flex flex-col" style={{ minHeight: '60vh', maxHeight: '80vh', overflowY: 'auto' }}>
            <button onClick={handleEditModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none" aria-label="Close"><FaTimes /></button>
            <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">Edit Application</h3>
            <form className="space-y-5" onSubmit={e => { e.preventDefault(); handleEditConfirm(editApp._id); }}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
                <input type="text" value={editApp.university} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required disabled={editMutation.isLoading} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Category</label>
                <input type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required disabled={editMutation.isLoading} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Degree</label>
                <input type="text" value={editDegree} onChange={e => setEditDegree(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required disabled={editMutation.isLoading} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Application Fees</label>
                <input type="number" min="0" value={editFees} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Service Charge</label>
                <input type="number" min="0" value={editServiceCharge} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <input type="text" value={editStatus.charAt(0).toUpperCase() + editStatus.slice(1)} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Application Feedback</label>
                <input type="text" value={editApp.feedback || ''} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={handleEditModalClose} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-base">Cancel</button>
                <button type="submit" disabled={editMutation.isLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base disabled:opacity-60 disabled:cursor-not-allowed">{editMutation.isLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {showReviewModal && reviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/30 bg-opacity-40">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-blue-100 flex flex-col" style={{ minHeight: '40vh', maxHeight: '80vh', overflowY: 'auto' }}>
            <button onClick={handleReviewModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none" aria-label="Close"><FaTimes /></button>
            <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">Add Review</h3>
            <form className="space-y-5" onSubmit={handleReviewSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Name</label>
                <input type="text" value={reviewApp.scholarshipName || reviewApp.scholarship || ''} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
                <input type="text" value={reviewApp.university} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">University ID</label>
                <input type="text" value={reviewApp.scholarshipId || reviewApp.universityId || ''} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                <input type="text" value={user.displayName} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Email</label>
                <input type="text" value={user.email} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Image (optional)</label>
                <input type="text" value={user.photoURL || ''} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating Point</label>
                <select value={reviewRating} onChange={e => setReviewRating(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required>
                  <option value="">Select rating</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Review Comment</label>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required rows={3} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Review Date</label>
                <input type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={handleReviewModalClose} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-base">Cancel</button>
                <button type="submit" disabled={reviewMutation.isLoading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-base disabled:opacity-60 disabled:cursor-not-allowed">{reviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplication;
