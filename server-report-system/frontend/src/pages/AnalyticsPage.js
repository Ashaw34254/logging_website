import React from 'react';
import { useAuth } from '../context/AuthContext';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const AnalyticsPage = () => {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  return <AnalyticsDashboard />;
};

export default AnalyticsPage;
