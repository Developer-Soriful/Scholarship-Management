import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import useAuth from '../../Auth/useAuth';
import Swal from 'sweetalert2';
import { FaTimes } from 'react-icons/fa';

const MyReview = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [editRating, setEditRating] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editDate, setEditDate] = useState('');

  // Fetch reviews by user
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/reviews?userEmail=${user.email}`);
      return Array.isArray(res.data) ? res.data : res.data.data || [];
    },
    enabled: !!user?.email,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ _id, rating, comment, date }) => {
      return axiosSecure.patch(`/reviews/${_id}`, { rating, comment, date });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-reviews', user?.email]);
      setEditModalOpen(false);
      setEditReview(null);
      setEditRating('');
      setEditComment('');
      setEditDate('');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Review updated!',
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (_id) => {
      return axiosSecure.delete(`/reviews/${_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-reviews', user?.email]);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Review deleted!',
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
        title: 'Failed to delete',
        text: err?.response?.data?.message || err.message,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    },
  });

  const handleEdit = (review) => {
    setEditReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditDate(review.date);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditReview(null);
    setEditRating('');
    setEditComment('');
    setEditDate('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editReview || !editRating || !editComment || !editDate) return;
    editMutation.mutate({
      _id: editReview._id,
      rating: editRating,
      comment: editComment,
      date: editDate,
    });
  };

  const handleDelete = (_id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this review?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'No',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(_id);
      }
    });
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 min-h-[75vh] w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-700">My Reviews</h1>
        <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-base">Refetch</button>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-xl bg-white border border-blue-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3">Scholarship Name</th>
              <th className="px-4 py-3">University Name</th>
              <th className="px-4 py-3">Review Comment</th>
              <th className="px-4 py-3">Review Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">No reviews found.</td>
              </tr>
            )}
            {reviews.map((review) => (
              <tr key={review._id} className="hover:bg-blue-50 transition">
                <td className="px-4 py-3 font-semibold">{review.scholarshipName}</td>
                <td className="px-4 py-3">{review.universityName}</td>
                <td className="px-4 py-3">{review.comment}</td>
                <td className="px-4 py-3">{review.date}</td>
                <td className="px-4 py-3 space-x-2 flex items-center">
                  <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs" onClick={() => handleEdit(review)} disabled={editMutation.isLoading}>Edit</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" onClick={() => handleDelete(review._id)} disabled={deleteMutation.isLoading}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModalOpen && editReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/30 bg-opacity-40">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-blue-100 flex flex-col" style={{ minHeight: '40vh', maxHeight: '80vh', overflowY: 'auto' }}>
            <button onClick={handleEditModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none" aria-label="Close"><FaTimes /></button>
            <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">Edit Review</h3>
            <form className="space-y-5" onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Name</label>
                <input type="text" value={editReview.scholarshipName} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
                <input type="text" value={editReview.universityName} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating Point</label>
                <select value={editRating} onChange={e => setEditRating(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required>
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
                <textarea value={editComment} onChange={e => setEditComment(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required rows={3} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Review Date</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={handleEditModalClose} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-base">Cancel</button>
                <button type="submit" disabled={editMutation.isLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base disabled:opacity-60 disabled:cursor-not-allowed">{editMutation.isLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReview;