import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  LightBulbIcon,
  UserGroupIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import AHRPLogo from './AHRPLogo';

const HeroSection = () => {
  const features = [
    {
      icon: DocumentTextIcon,
      title: "Easy Reporting",
      description: "Submit reports quickly through our intuitive interface"
    },
    {
      icon: ChartBarIcon,
      title: "Real-time Analytics",
      description: "Track report status and statistics in real-time"
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure & Private",
      description: "Your reports are encrypted and handled securely"
    },
    {
      icon: LightBulbIcon,
      title: "Smart Categories",
      description: "Intelligent categorization for faster resolution"
    },
    {
      icon: UserGroupIcon,
      title: "Community Driven",
      description: "Built for the AHRP community by the community"
    },
    {
      icon: ClockIcon,
      title: "24/7 Available",
      description: "Submit and track reports anytime, anywhere"
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Hero Content */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <AHRPLogo className="h-16 w-16" showText={true} />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              AHRP Report System
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            A comprehensive reporting platform designed for the Arizona High Roleplay community. 
            Submit reports, track progress, and help maintain the quality of our server.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/submit"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Submit a Report
            </Link>
            
            <Link
              to="/stats"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Statistics
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-200 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                1,247
              </div>
              <div className="text-gray-600 font-medium">Total Reports</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                98%
              </div>
              <div className="text-gray-600 font-medium">Resolution Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                2.4h
              </div>
              <div className="text-gray-600 font-medium">Avg Response</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-gray-600 font-medium">Availability</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;