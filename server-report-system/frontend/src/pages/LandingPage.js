import React from 'react';
import HeroSection from '../components/HeroSection';
import { Link } from 'react-router-dom';
import { 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const recentReports = [
    {
      id: 1,
      type: "Bug Report",
      title: "Character stuck in animation",
      status: "resolved",
      time: "2 hours ago",
      category: "gameplay"
    },
    {
      id: 2,
      type: "Player Report",
      title: "RDM incident on highway",
      status: "investigating",
      time: "4 hours ago",
      category: "rules"
    },
    {
      id: 3,
      type: "Suggestion",
      title: "Add new vehicle spawn location",
      status: "pending",
      time: "1 day ago",
      category: "enhancement"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'investigating':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Recent Reports Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recent Community Reports
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what our community is working on. Track the latest reports and their resolution status.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(report.status)}
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{report.time}</span>
                </div>

                <div className="mb-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md mb-2">
                    {report.type}
                  </span>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {report.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 capitalize">
                    {report.category}
                  </span>
                  <Link
                    to={`/reports/${report.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    View Details
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/stats"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              View All Statistics
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Help us maintain the quality of AHRP by reporting issues, suggesting improvements, 
            or providing feedback on your experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/submit"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Submit Your Report
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">AR</span>
                </div>
                <span className="text-xl font-bold">AHRP Report System</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                A comprehensive reporting platform designed to help maintain the quality and 
                integrity of the Arizona High Roleplay gaming community.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/submit" className="hover:text-white transition-colors">Submit Report</Link></li>
                <li><Link to="/stats" className="hover:text-white transition-colors">View Statistics</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Staff Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Discord</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Arizona High Roleplay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;