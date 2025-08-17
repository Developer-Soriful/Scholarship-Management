import React, { useState, useEffect, useMemo } from 'react';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2'; // Removed Pie as it's not used
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
  FaTimesCircle,
} from 'react-icons/fa';

// Register Chart.js components once, outside of the component
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

// Define a common function for fetching data to avoid repetition
const fetchAnalyticsData = async (endpoint) => {
  const res = await axiosSecure.get(endpoint);
  return res.data;
};

const Analytics = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Use a single parallel query hook for better performance and error handling
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: async () => {
      const [users, scholarships, applications] = await Promise.all([
        fetchAnalyticsData('/users'),
        fetchAnalyticsData('/scholarship-admin'),
        fetchAnalyticsData('/allApplied-scholarship'),
      ]);
      return { users, scholarships, applications };
    },
    enabled: !!user,
  });

  const { users = [], scholarships = [], applications = [] } = analyticsData || {};

  // Display loading spinner while data is being fetched
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Use useMemo for heavy calculations to prevent re-rendering on every state change
  const {
    totalUsers,
    totalScholarships,
    totalApplications,
    totalReviews,
    userRoles,
    scholarshipCategories,
    applicationStatuses,
    userTrend,
    applicationTrend,
    ratingDistribution,
    allRatings,
    topUniversities,
  } = useMemo(() => {
    // --- Data Calculation Logic (Moved inside useMemo) ---
    const totalUsers = users.length;
    const totalScholarships = scholarships.length;
    const totalApplications = applications.length;
    const allRatings = scholarships.flatMap(s => s.ratings?.map(r => r.point) || []);
    const totalReviews = allRatings.length;

    const userRoles = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const scholarshipCategories = scholarships.reduce((acc, scholarship) => {
      acc[scholarship.scholarshipCategory] = (acc[scholarship.scholarshipCategory] || 0) + 1;
      return acc;
    }, {});

    const applicationStatuses = applications.reduce((acc, application) => {
      acc[application.status] = (acc[application.status] || 0) + 1;
      return acc;
    }, {});

    const getMonthlyData = (data, dateField) => {
      const months = [];
      const counts = [];
      const now = new Date();
      const oneMonth = 30 * 24 * 60 * 60 * 1000; // Simplified month length
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthName);
        
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getTime();
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getTime();
        
        const count = data.filter(item => {
          const itemDate = new Date(item[dateField]).getTime();
          return itemDate >= monthStart && itemDate <= monthEnd;
        }).length;
        
        counts.push(count);
      }
      return { months, counts };
    };

    const userTrend = getMonthlyData(users, 'created_at');
    const applicationTrend = getMonthlyData(applications, 'date');

    const ratingDistribution = allRatings.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    const universityApplications = applications.reduce((acc, application) => {
      acc[application.university] = (acc[application.university] || 0) + 1;
      return acc;
    }, {});

    const topUniversities = Object.entries(universityApplications)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalUsers,
      totalScholarships,
      totalApplications,
      totalReviews,
      userRoles,
      scholarshipCategories,
      applicationStatuses,
      userTrend,
      applicationTrend,
      ratingDistribution,
      allRatings,
      topUniversities,
    };
  }, [users, scholarships, applications]);

  // --- Chart Configurations (Simplified) ---
  const chartOptions = (titleText) => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: titleText },
    },
    scales: { y: { beginAtZero: true } },
  });

  const chartData = (labels, data, label, color) => ({
    labels,
    datasets: [{
      label,
      data,
      borderColor: `rgb(${color})`,
      backgroundColor: `rgba(${color}, 0.1)`,
      fill: true,
      tension: 0.4,
    }],
  });

  const pieChartData = (labels, data, colors) => ({
    labels,
    datasets: [{
      data,
      backgroundColor: colors.map(c => `rgba(${c}, 0.8)`),
      borderWidth: 2,
      borderColor: '#fff',
    }],
  });

  const colors = {
    blue: '59, 130, 246',
    green: '16, 185, 129',
    yellow: '245, 158, 11',
    purple: '139, 92, 246',
    red: '239, 68, 68',
  };

  const userTrendChart = {
    data: chartData(userTrend.months, userTrend.counts, 'New Users', colors.blue),
    options: chartOptions('User Registration Trend (Last 6 Months)'),
  };

  const applicationTrendChart = {
    data: chartData(applicationTrend.months, applicationTrend.counts, 'Applications', colors.green),
    options: chartOptions('Application Trend (Last 6 Months)'),
  };

  const userRoleChart = {
    data: pieChartData(Object.keys(userRoles), Object.values(userRoles), [colors.blue, colors.green, colors.yellow]),
    options: { ...chartOptions('User Role Distribution'), plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'User Role Distribution' } } },
  };

  const scholarshipCategoryChart = {
    data: pieChartData(Object.keys(scholarshipCategories), Object.values(scholarshipCategories), [colors.green, colors.yellow, colors.red]),
    options: { ...chartOptions('Scholarship Category Distribution'), plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Scholarship Category Distribution' } } },
  };

  const applicationStatusChart = {
    data: {
      labels: Object.keys(applicationStatuses),
      datasets: [{
        label: 'Applications',
        data: Object.values(applicationStatuses),
        backgroundColor: [
          `rgba(${colors.yellow}, 0.8)`,
          `rgba(${colors.purple}, 0.8)`,
          `rgba(${colors.green}, 0.8)`,
          `rgba(${colors.red}, 0.8)`,
        ],
      }],
    },
    options: chartOptions('Application Status Distribution'),
  };
  
  const ratingDistributionChart = {
    data: {
      labels: Object.keys(ratingDistribution).map(rating => `${rating} Stars`),
      datasets: [{
        label: 'Number of Reviews',
        data: Object.values(ratingDistribution),
        backgroundColor: `rgba(${colors.yellow}, 0.8)`,
      }],
    },
    options: chartOptions('Rating Distribution'),
  };

  const topUniversitiesChart = {
    data: {
      labels: topUniversities.map(([university]) => university),
      datasets: [{
        label: 'Applications',
        data: topUniversities.map(([, count]) => count),
        backgroundColor: `rgba(${colors.blue}, 0.8)`,
      }],
    },
    options: chartOptions('Top Universities by Applications'),
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaChartLine },
    { id: 'users', name: 'Users', icon: FaUsers },
    { id: 'scholarships', name: 'Scholarships', icon: FaGraduationCap },
    { id: 'applications', name: 'Applications', icon: FaFileAlt },
    { id: 'reviews', name: 'Reviews', icon: FaStar },
  ];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-[75vh] font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights into your scholarship platform</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-blue-600 text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FaGraduationCap className="text-green-600 text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Scholarships</p>
              <p className="text-3xl font-bold text-gray-900">{totalScholarships}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaFileAlt className="text-purple-600 text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaStar className="text-yellow-600 text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{totalReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 overflow-x-auto">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 md:space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-colors duration-300 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Bar {...applicationStatusChart} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Bar {...topUniversitiesChart} />
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
            <div className="bg-white rounded-xl p-6 shadow-lg flex flex-col justify-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Review Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <span className="text-gray-600 text-lg">Average Rating</span>
                  <span className="font-bold text-blue-600 text-2xl">
                    {allRatings.length > 0
                      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
                      : '0.0'
                    } / 5
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  <span className="text-gray-600 text-lg">Total Reviews</span>
                  <span className="font-bold text-green-600 text-2xl">{totalReviews}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                  <span className="text-gray-600 text-lg">Scholarships with Reviews</span>
                  <span className="font-bold text-purple-600 text-2xl">
                    {scholarships.filter(s => s.ratings?.length > 0).length}
                  </span>
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