import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import LoadingSpinner from '../../Components/LoadingSpinner';
import Swal from 'sweetalert2';
import { FaEye, FaComment, FaTimes, FaCheck, FaClock, FaSpinner } from 'react-icons/fa';

const fetchAppliedScholarships = async () => {
  const res = await axiosSecure.get('/allApplied-scholarship');
  return res.data;
};

const updateApplicationStatus = async ({ id, status }) => {
  
    // Only send status field, not other fields
    const res = await axiosSecure.patch(`/applied-scholarship/${id}`, { 
        status: status 
        // Don't send other fields here
    });
    return res.data;
};

const ManageAppliedApplication = () => {
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applied-scholarships'],
    queryFn: fetchAppliedScholarships,
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['applied-scholarships']);
      Swal.fire({
        icon: 'success',
        title: 'Status updated successfully!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Failed to update status',
        text: error.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    },
  });

  const handleStatusUpdate = (applicationId, newStatus) => {
    updateStatusMutation.mutate({ id: applicationId, status: newStatus });
  };

  const handleDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleFeedback = (application) => {
    setSelectedApplication(application);
    setShowFeedbackModal(true);
  };

  const handleCancel = async (applicationId) => {
    console.log(applicationId);
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel this application?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Cancel Application',
      cancelButtonText: 'No',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/applied-scholarship/${applicationId}`);
        if (res.data) {
          queryClient.invalidateQueries(['applied-scholarships']);
          Swal.fire({
            icon: 'success',
            title: 'Application cancelled successfully!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to cancel application',
          text: error.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Feedback is required',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      // Only send feedback, not status
      const res = await axiosSecure.patch(`/applied-scholarship-feedback/${selectedApplication._id}`, {
        feedback: feedback
        // Don't send status field here
      });
      if (res.data) {
        queryClient.invalidateQueries(['applied-scholarships']);
        setShowFeedbackModal(false);
        setFeedback('');
        setSelectedApplication(null);
        Swal.fire({
          icon: 'success',
          title: 'Feedback submitted successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to submit feedback',
        text: error.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'processing':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'completed':
        return <FaCheck className="text-green-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6 text-teal-700">Manage Applied Applications</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaClock className="text-yellow-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaSpinner className="text-blue-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-blue-600">
                {applications.filter(app => app.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaCheck className="text-green-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaTimes className="text-red-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-600">{applications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Applicant</th>
              <th className="py-3 px-4 text-left">Scholarship</th>
              <th className="py-3 px-4 text-left">University</th>
              <th className="py-3 px-4 text-left">Applied Date</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(application => (
              <tr key={application._id} className="border-b hover:bg-teal-50 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <img
                      src={application.photo}
                      alt={application.userName}
                      className="w-10 h-10 rounded-full mr-3"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40x40?text=U';
                      }}
                    />
                    <div>
                      <p className="font-medium">{application.userName}</p>
                      <p className="text-sm text-gray-500">{application.userEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{application.scholarshipCategory}</p>
                    <p className="text-sm text-gray-500">{application.subjectCategory}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium">{application.university}</p>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {new Date(application.date).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <select
                      className="text-xs border rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-400"
                      value={application.status || 'pending'}
                      onChange={(e) => handleStatusUpdate(application._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleDetails(application)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleFeedback(application)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                      title="Add Feedback"
                    >
                      <FaComment />
                    </button>
                    <button
                      onClick={() => handleCancel(application._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Cancel Application"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-black/20 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-700">Application Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Applicant Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedApplication.userName}</p>
                  <p><span className="font-medium">Email:</span> {selectedApplication.userEmail}</p>
                  <p><span className="font-medium">Phone:</span> {selectedApplication.phone}</p>
                  <p><span className="font-medium">Gender:</span> {selectedApplication.gender}</p>
                  <p><span className="font-medium">Address:</span> {selectedApplication.address}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Academic Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Degree:</span> {selectedApplication.degree}</p>
                  <p><span className="font-medium">SSC Result:</span> {selectedApplication.ssc}</p>
                  <p><span className="font-medium">HSC Result:</span> {selectedApplication.hsc}</p>
                  <p><span className="font-medium">Study Gap:</span> {selectedApplication.studyGap || 'No Gap'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Scholarship Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">University:</span> {selectedApplication.university}</p>
                  <p><span className="font-medium">Category:</span> {selectedApplication.scholarshipCategory}</p>
                  <p><span className="font-medium">Subject:</span> {selectedApplication.subjectCategory}</p>
                  <p><span className="font-medium">Applied Date:</span> {new Date(selectedApplication.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Status Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Current Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </span>
                  </p>
                  {selectedApplication.feedback && (
                    <p><span className="font-medium">Feedback:</span> {selectedApplication.feedback}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-black/20 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-700">Add Feedback</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback for {selectedApplication.userName}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows="4"
                placeholder="Enter your feedback..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppliedApplication;