import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosSecure from '../../Axios/axiosSecure';
import useAuth from '../../Auth/useAuth';
import LoadingSpinner from '../../Components/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { 
  FaUsers, 
  FaGraduationCap, 
  FaFileAlt, 
  FaStar,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaUniversity,
  FaUserGraduate,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all data for analytics
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: scholarships = [], isLoading: scholarshipsLoading } = useQuery({
    queryKey: ['scholarships'],
    queryFn: async () => {
      const res = await axiosSecure.get('/scholarship-admin');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await axiosSecure.get('/allApplied-scholarship');
      return res.data;
    },
    enabled: !!user,
  });

  if (usersLoading || scholarshipsLoading || applicationsLoading) {
    return <LoadingSpinner />;
  }

  // Calculate analytics data
  const totalUsers = users.length;
  const totalScholarships = scholarships.length;
  const totalApplications = applications.length;
  const totalReviews = scholarships.reduce((acc, scholarship) => {
    return acc + (scholarship.ratings?.length || 0);
  }, 0);

  // User role distribution
  const userRoles = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  // Scholarship category distribution
  const scholarshipCategories = scholarships.reduce((acc, scholarship) => {
    acc[scholarship.scholarshipCategory] = (acc[scholarship.scholarshipCategory] || 0) + 1;
    return acc;
  }, {});

  // Application status distribution
  const applicationStatuses = applications.reduce((acc, application) => {
    acc[application.status] = (acc[application.status] || 0) + 1;
    return acc;
  }, {});

  // Monthly user registration trend (last 6 months)
  const getMonthlyData = (data, dateField) => {
    const months = [];
    const counts = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      months.push(monthName);
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= monthStart && itemDate <= monthEnd;
      }).length;
      
      counts.push(count);
    }
    
    return { months, counts };
  };

  const userTrend = getMonthlyData(users, 'created_at');
  const applicationTrend = getMonthlyData(applications, 'date');

  // Rating distribution
  const allRatings = scholarships.reduce((acc, scholarship) => {
    if (scholarship.ratings && Array.isArray(scholarship.ratings)) {
      scholarship.ratings.forEach(rating => {
        acc.push(rating.point);
      });
    }
    return acc;
  }, []);

  const ratingDistribution = allRatings.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  // Top universities by applications
  const universityApplications = applications.reduce((acc, application) => {
    acc[application.university] = (acc[application.university] || 0) + 1;
    return acc;
  }, {});

  const topUniversities = Object.entries(universityApplications)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Chart configurations
  const userTrendChart = {
    data: {
      labels: userTrend.months,
      datasets: [
        {
          label: 'New Users',
          data: userTrend.counts,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'User Registration Trend (Last 6 Months)',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const applicationTrendChart = {
    data: {
      labels: applicationTrend.months,
      datasets: [
        {
          label: 'Applications',
          data: applicationTrend.counts,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Application Trend (Last 6 Months)',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const userRoleChart = {
    data: {
      labels: Object.keys(userRoles),
      datasets: [
        {
          data: Object.values(userRoles),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'User Role Distribution',
        },
      },
    },
  };

  const scholarshipCategoryChart = {
    data: {
      labels: Object.keys(scholarshipCategories),
      datasets: [
        {
          data: Object.values(scholarshipCategories),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Scholarship Category Distribution',
        },
      },
    },
  };

  const applicationStatusChart = {
    data: {
      labels: Object.keys(applicationStatuses),
      datasets: [
        {
          label: 'Applications',
          data: Object.values(applicationStatuses),
          backgroundColor: [
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Application Status Distribution',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const ratingDistributionChart = {
    data: {
      labels: Object.keys(ratingDistribution).map(rating => `${rating} Stars`),
      datasets: [
        {
          label: 'Number of Reviews',
          data: Object.values(ratingDistribution),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Rating Distribution',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const topUniversitiesChart = {
    data: {
      labels: topUniversities.map(([university]) => university),
      datasets: [
        {
          label: 'Applications',
          data: topUniversities.map(([, count]) => count),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Top Universities by Applications',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaChartLine },
    { id: 'users', name: 'Users', icon: FaUsers },
    { id: 'scholarships', name: 'Scholarships', icon: FaGraduationCap },
    { id: 'applications', name: 'Applications', icon: FaFileAlt },
    { id: 'reviews', name: 'Reviews', icon: FaStar },
  ];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-[75vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights into your scholarship platform</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaGraduationCap className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Scholarships</p>
              <p className="text-2xl font-bold text-gray-900">{totalScholarships}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaFileAlt className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaStar className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Line {...userTrendChart} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Line {...applicationTrendChart} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Doughnut {...userRoleChart} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Doughnut {...scholarshipCategoryChart} />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Line {...userTrendChart} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Doughnut {...userRoleChart} />
            </div>
          </div>
        )}

        {activeTab === 'scholarships' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Doughnut {...scholarshipCategoryChart} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Bar {...topUniversitiesChart} />
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Line {...applicationTrendChart} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Bar {...applicationStatusChart} />
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Bar {...ratingDistributionChart} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-bold text-blue-600">
                      {allRatings.length > 0 
                        ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
                        : '0.0'
                      } / 5
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-bold text-green-600">{totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Scholarships with Reviews</span>
                    <span className="font-bold text-purple-600">
                      {scholarships.filter(s => s.ratings?.length > 0).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 