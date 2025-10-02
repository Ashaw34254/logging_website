import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loginStatus, setLoginStatus] = useState('idle');

  useEffect(() => {
    // If already authenticated, show success state
    if (isAuthenticated && user) {
      setLoginStatus('success');
      return;
    }

    // Handle error messages from URL params
    const error = searchParams.get('error');
    if (error) {
      setLoginStatus('error');
      switch (error) {
        case 'auth_failed':
          toast.error('Authentication failed. Please try again.');
          break;
        case 'server_error':
          toast.error('Server error occurred. Please try again later.');
          break;
        case 'access_denied':
          toast.error('Access denied. Please contact an administrator.');
          break;
        default:
          toast.error('An error occurred during login.');
      }
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  const handleDiscordLogin = () => {
    setLoginStatus('loading');
    try {
      login();
      toast.success('Redirecting to Discord login...');
    } catch (error) {
      console.error('Login error:', error);
      setLoginStatus('error');
      toast.error('Failed to initiate Discord login');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLoginStatus('idle');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication status...</p>
        </div>
      </div>
    );
  }

  // Success state - User is logged in
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">AR</span>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              AHRP Report System
            </h2>
          </div>

          {/* Success message */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                {user.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png`}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Login Successful!</h3>
              <p className="text-gray-700 mb-2">
                Welcome, <span className="font-semibold">{user.username}</span>
                {user.discriminator && user.discriminator !== '0' && (
                  <span className="text-gray-500">#{user.discriminator}</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                Role: <span className="font-medium capitalize">{user.role}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={goToDashboard}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 font-medium"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login form state - User needs to authenticate  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">AR</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            AHRP Report System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the reporting dashboard
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {/* Welcome message */}
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to AHRP
              </h3>
              <p className="text-sm text-gray-600">
                Please sign in with your Discord account to continue. Only authorized staff members can access the dashboard.
              </p>
            </div>

            {/* Discord login button */}
            <div>
              <button
                onClick={handleDiscordLogin}
                disabled={loginStatus === 'loading'}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-discord-500 hover:bg-discord-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-discord-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginStatus === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Redirecting...
                  </>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </span>
                    Continue with Discord
                  </>
                )}
              </button>
            </div>

            {/* Error state */}
            {loginStatus === 'error' && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Authentication Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Failed to authenticate with Discord. Please try again or contact support if the issue persists.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info message */}
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    First time here?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      After signing in, you'll be assigned a default role. Contact an administrator if you need elevated permissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Public links */}
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-600">
            Don't need to sign in?
          </div>
          <div className="space-x-4">
            <a
              href="/submit"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Submit a Report
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="/stats"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              View Public Stats
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            <br />
            This system is for authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;