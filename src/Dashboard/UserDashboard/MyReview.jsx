import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import useAuth from '../../Auth/useAuth';
import Swal from 'sweetalert2';
import { FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../../Components/LoadingSpinner';

const MyReview = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [editRating, setEditRating] = useState('');
  const [editComment, setEditComment] = useState('');
  if (loading) {
    return <LoadingSpinner />
  }
  // Fetch reviews by user
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ['my-reviewOfScholarship', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/reviewOfScholarship?email=${user.email}`);
      return res.data.data || [];
    },
    enabled: !!user?.email,
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ _id, rating, comment, reviewerEmail }) => {
      return axiosSecure.patch(`/updateReviews/${_id}`, { rating, comment, reviewerEmail });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-reviewOfScholarship', user?.email]);
      setEditModalOpen(false);
      setEditReview(null);
      setEditRating('');
      setEditComment('');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Review updated!',
        showConfirmButton: false,
        timer: 1500,
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
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (_id) => {
      return axiosSecure.delete(`/deleteReview/${_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-reviewOfScholarship', user?.email]);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Review deleted!',
        showConfirmButton: false,
        timer: 1500,
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
      });
    },
  });

  const handleEdit = (review) => {
    setEditReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditReview(null);
    setEditRating('');
    setEditComment('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editReview || !editRating || !editComment) return;
    editMutation.mutate({
      _id: editReview._id,
      rating: editRating,
      comment: editComment,
      reviewerEmail: user.email
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

  console.log(reviews)
  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="p-4 md:p-8 bg-gradi
ent-to-br from-blue-50 via-purple-50 to-indigo-100 min-h-[75vh] w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700">My Reviews</h1>
        <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-base w-full sm:w-auto">Refetch</button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl shadow-xl bg-white border border-blue-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Scholarship Name</th>
              <th className="px-4 py-3 text-left">University Name</th>
              <th className="px-4 py-3 text-center">Rating</th>
              <th className="px-4 py-3 text-left">Review Comment</th>
              <th className="px-4 py-3 text-left">Review Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No reviews found.</td>
              </tr>
            )}
            {reviews.map((review, index) => (
              <tr key={`${review._id}-${index}`} className="hover:bg-blue-50 transition">
                <td className="px-4 py-3 font-semibold">{review.scholarshipName || 'Name Not defined by mistack'}</td>
                <td className="px-4 py-3">{review.universityName}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 max-w-xs truncate">{review.comment}</td>
                <td className="px-4 py-3">{review.date}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center space-x-2">
                    <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs" onClick={() => handleEdit(review)} disabled={editMutation.isLoading}>Edit</button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" onClick={() => handleDelete(review._id)} disabled={deleteMutation.isLoading}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-4">
        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-400 bg-white rounded-2xl shadow-xl border border-blue-100">
            No reviews found.
          </div>
        )}
        {reviews.map((review, index) => (
          <div key={`${index}`} className="bg-white rounded-2xl shadow-xl border border-blue-100 p-4 space-y-3">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                  {review.scholarshipName || 'Name Not defined by mistack'}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm">{review.universityName}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs font-medium transition"
                  onClick={() => handleEdit(review)}
                  disabled={editMutation.isLoading}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-medium transition"
                  onClick={() => handleDelete(review._id)}
                  disabled={deleteMutation.isLoading}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">Rating:</span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <span className="text-xs text-gray-600 block mb-1">Comment:</span>
              <p className="text-sm text-gray-800 leading-relaxed">{review.comment}</p>
            </div>

            {/* Date */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">Date:</span>
              <span className="text-sm text-gray-800">{review.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editModalOpen && editReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/30 bg-opacity-40 p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-blue-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleEditModalClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none transition-colors"
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Edit Review</h3>
              <p className="text-gray-600 text-sm">
                Update your review for {editReview.scholarshipName}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleEditSubmit}>
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                  How would you rate your experience?
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star.toString())}
                      className={`text-2xl md:text-3xl transition-all duration-200 hover:scale-110 ${parseInt(editRating) >= star
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                        }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {editRating && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    You rated: {editRating} star{parseInt(editRating) > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tell us about your experience
                </label>
                <textarea
                  value={editComment}
                  onChange={e => setEditComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                  placeholder="Share your thoughts, feedback, or suggestions..."
                  required
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editComment.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleEditModalClose}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isLoading || !editRating || !editComment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
                >
                  {editMutation.isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReview;