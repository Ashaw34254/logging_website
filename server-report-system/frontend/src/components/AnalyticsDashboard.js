import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import apiService from '../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    pendingReports: 0,
    avgResponseTime: 0,
  });

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Future implementation: const response = await apiService.get(`/analytics/dashboard?period=${timeRange}`);
      // For now, we'll use mock data
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds
    fetchRealTimeData();

    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchRealTimeData = async () => {
    try {
      const response = await apiService.get('/analytics/realtime');
      setRealTimeData(response.data);
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    }
  };

  // Generate mock data for demonstration
  const generateMockData = () => {
    const days = parseInt(timeRange);
    const labels = Array.from({ length: days }, (_, i) => 
      format(subDays(new Date(), days - 1 - i), 'MMM dd')
    );
    
    return {
      reportsOverTime: {
        labels,
        datasets: [
          {
            label: 'New Reports',
            data: labels.map(() => Math.floor(Math.random() * 50) + 10),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
          },
          {
            label: 'Resolved Reports',
            data: labels.map(() => Math.floor(Math.random() * 45) + 8),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      reportsByCategory: {
        labels: ['Player Reports', 'Bug Reports', 'Suggestions', 'Rule Violations', 'Technical Issues'],
        datasets: [
          {
            data: [35, 25, 15, 20, 5],
            backgroundColor: [
              '#ef4444',
              '#f97316',
              '#eab308',
              '#22c55e',
              '#3b82f6'
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      reportsByPriority: {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        datasets: [
          {
            label: 'Reports by Priority',
            data: [40, 35, 20, 5],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 191, 36, 0.8)',
              'rgba(249, 115, 22, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            borderColor: [
              'rgba(34, 197, 94, 1)',
              'rgba(251, 191, 36, 1)',
              'rgba(249, 115, 22, 1)',
              'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      staffPerformance: {
        labels: ['Admin1', 'Mod1', 'Mod2', 'Helper1', 'Helper2'],
        datasets: [
          {
            label: 'Reports Handled',
            data: [45, 38, 42, 28, 35],
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
          },
        ],
      },
      responseTimeData: {
        labels: labels,
        datasets: [
          {
            label: 'Avg Response Time (hours)',
            data: labels.map(() => Math.random() * 8 + 1),
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
    };
  };

  const mockData = generateMockData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Real-time insights into your server's reporting system</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeData.activeUsers || 24}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeData.pendingReports || 12}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeData.avgResponseTime || 2.4}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Reports Over Time */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Over Time</h3>
            <Line data={mockData.reportsOverTime} options={chartOptions} />
          </div>

          {/* Reports by Category */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Category</h3>
            <Doughnut data={mockData.reportsByCategory} options={doughnutOptions} />
          </div>

          {/* Reports by Priority */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Priority</h3>
            <Bar data={mockData.reportsByPriority} options={chartOptions} />
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h3>
            <Bar data={mockData.staffPerformance} options={chartOptions} />
          </div>
        </div>

        {/* Response Time Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Response Time Trend</h3>
          <Line data={mockData.responseTimeData} options={chartOptions} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Report #{1000 + item} was resolved</p>
                    <p className="text-xs text-gray-500">{item} minutes ago by Staff Member</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;