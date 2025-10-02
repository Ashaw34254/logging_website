import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/apiService';

const ReportDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/reports/${id}`);
        setReport(response.data.report);
      } catch (error) {
        console.error('Failed to fetch report:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);



  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Report Not Found</h2>
          <p className="mt-2 text-gray-600">The requested report could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Report #{report.id}</h1>
            <div className="mt-2 flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(report.status)}`}>
                {report.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                {report.type.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Priority: {report.priority.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Report Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1 text-sm text-gray-900">{report.category}</p>
                </div>
                {report.subcategory && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Subcategory</h3>
                    <p className="mt-1 text-sm text-gray-900">{report.subcategory}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="mt-1 text-sm text-gray-900">{new Date(report.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1 text-sm text-gray-900">{new Date(report.updated_at).toLocaleString()}</p>
                </div>
                {report.reporter_username && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Reporter</h3>
                    <p className="mt-1 text-sm text-gray-900">{report.reporter_username}</p>
                  </div>
                )}
                {report.handler_username && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Handler</h3>
                    <p className="mt-1 text-sm text-gray-900">{report.handler_username}</p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.description}</p>
                </div>
              </div>
              
              {report.resolution_notes && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Resolution Notes</h3>
                  <div className="bg-green-50 rounded-md p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.resolution_notes}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                  Edit Report
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
