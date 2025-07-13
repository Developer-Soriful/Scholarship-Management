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

const AllAppliedApplications = () => {
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applied-scholarships'],
    queryFn: fetchAppliedScholarships,
  });

  // Search filter logic
  const filteredApplications = applications.filter(app => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      app.userName?.toLowerCase().includes(search) ||
      app.userEmail?.toLowerCase().includes(search) ||
      app.university?.toLowerCase().includes(search)
    );
  });
  // Sorting logic
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'date-asc') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'deadline-desc') {
      return new Date(b.scholarshipDeadline) - new Date(a.scholarshipDeadline);
    } else if (sortBy === 'deadline-asc') {
      return new Date(a.scholarshipDeadline) - new Date(b.scholarshipDeadline);
    }
    return 0;
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
        return <FaSpinner className="text-purple-500 animate-spin" />;
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
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-2 sm:p-4 md:p-8 min-h-[75vh] w-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700 mb-2">All Applied Applications</h2>
        <p className="text-gray-600 text-sm sm:text-base">Review and manage scholarship applications</p>
        <div className="mt-4 max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or university..."
            className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="date-desc">Applied Date (Newest First)</option>
            <option value="date-asc">Applied Date (Oldest First)</option>
            <option value="deadline-desc">Scholarship Deadline (Newest First)</option>
            <option value="deadline-asc">Scholarship Deadline (Oldest First)</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border border-purple-100">
          <div className="flex items-center">
            <FaClock className="text-yellow-500 text-xl sm:text-2xl mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-purple-100">
          <div className="flex items-center">
            <FaSpinner className="text-purple-500 text-xl sm:text-2xl mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Processing</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">
                {applications.filter(app => app.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-purple-100">
          <div className="flex items-center">
            <FaCheck className="text-green-500 text-xl sm:text-2xl mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Completed</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-purple-100">
          <div className="flex items-center">
            <FaTimes className="text-red-500 text-xl sm:text-2xl mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-600">{applications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {sortedApplications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">No Applications Found</p>
            <p className="text-gray-500">There are no applications to display at the moment.</p>
          </div>
        ) : (
          sortedApplications.map(application => (
            <div key={application._id} className="bg-white rounded-lg shadow-md p-4 border border-purple-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <img
                    src={application.photo}
                    alt={application.userName}
                    className="w-12 h-12 rounded-full mr-3"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48?text=U';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{application.userName}</h3>
                    <p className="text-gray-600 text-xs">{application.userEmail}</p>
                    <p className="text-purple-600 text-xs font-medium">{application.university}</p>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleDetails(application)}
                    className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                    title="View Details"
                  >
                    <FaEye size={14} />
                  </button>
                  <button
                    onClick={() => handleFeedback(application)}
                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                    title="Add Feedback"
                  >
                    <FaComment size={14} />
                  </button>
                  <button
                    onClick={() => handleCancel(application._id)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Cancel Application"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium text-gray-900">{application.scholarshipCategory}</p>
                </div>
                <div>
                  <span className="text-gray-500">Subject:</span>
                  <p className="font-medium text-gray-900">{application.subjectCategory}</p>
                </div>
                <div>
                  <span className="text-gray-500">Applied:</span>
                  <p className="font-medium text-gray-900">{new Date(application.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(application.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <select
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  value={application.status || 'pending'}
                  onChange={(e) => handleStatusUpdate(application._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-lg shadow-lg border border-purple-100">
        <table className="min-w-full bg-white">
          <thead className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold">Applicant</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Scholarship</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">University</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Applied Date</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Status</th>
              <th className="py-3 px-4 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedApplications.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No Applications Found</p>
                    <p className="text-gray-500">There are no applications to display at the moment.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedApplications.map(application => (
                <tr key={application._id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors duration-200">
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
                        <p className="font-medium text-gray-900">{application.userName}</p>
                        <p className="text-sm text-gray-500">{application.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{application.scholarshipCategory}</p>
                      <p className="text-sm text-gray-500">{application.subjectCategory}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{application.university}</p>
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
                        className="text-xs border rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDetails(application)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleFeedback(application)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors duration-200"
                        title="Add Feedback"
                      >
                        <FaComment size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel(application._id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        title="Cancel Application"
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
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-black/20 bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-purple-700">Application Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-black/20 bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-purple-700">Add Feedback</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl p-1 hover:bg-gray-100 rounded-full transition-colors"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                rows="4"
                placeholder="Enter your feedback..."
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm sm:text-base"
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

export default AllAppliedApplications;
