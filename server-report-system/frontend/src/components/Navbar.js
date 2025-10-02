import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  UsersIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid,
  DocumentTextIcon as DocumentTextSolid,
  ChartBarIcon as ChartBarSolid,
  UsersIcon as UsersSolid
} from '@heroicons/react/24/solid';
import AHRPLogo from './AHRPLogo';

const Navbar = () => {
  const { user, isAuthenticated, logout, hasPermission, getUserDisplayName, getUserAvatarUrl, getRoleColor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        activeIcon: HomeSolid,
        current: location.pathname === '/dashboard',
        show: isAuthenticated
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: DocumentTextIcon,
        activeIcon: DocumentTextSolid,
        current: location.pathname.startsWith('/reports'),
        show: isAuthenticated
      },
      {
        name: 'Analytics',
        href: '/analytics',
        icon: ChartBarIcon,
        activeIcon: ChartBarSolid,
        current: location.pathname === '/analytics',
        show: isAuthenticated && hasPermission('support')
      },
      {
        name: 'Users',
        href: '/users',
        icon: UsersIcon,
        activeIcon: UsersSolid,
        current: location.pathname === '/users',
        show: isAuthenticated && hasPermission('admin')
      }
    ];

    return items.filter(item => item.show);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <AHRPLogo className="h-8 w-8" showText={true} />
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.current ? item.activeIcon : item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      item.current
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {/* Public links for non-authenticated users */}
            {!isAuthenticated && (
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                <Link
                  to="/submit"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Submit Report
                </Link>
                <Link
                  to="/stats"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Public Stats
                </Link>

                <Link
                  to="/login"
                  className="btn-discord text-sm"
                >
                  Login with Discord
                </Link>
              </div>
            )}

            {/* Authenticated user menu */}
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                {/* Notification bell */}
                <button
                  type="button"
                  className="relative bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => {/* TODO: Open notifications panel */}}
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" />
                  {/* TODO: Implement notifications system */}
                  {false && (
                    <span className="notification-dot"></span>
                  )}
                </button>

                {/* Profile dropdown */}
                <div className="relative ml-3">
                  <div>
                    <button
                      type="button"
                      className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={getUserAvatarUrl()}
                        alt={getUserDisplayName()}
                      />
                    </button>
                  </div>

                  {/* Profile dropdown menu */}
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                        <p className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getRoleColor(user?.role)}`}>
                          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                        </p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <UserCircleIcon className="h-4 w-4 mr-2" />
                        Your Profile
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="sm:hidden ml-2">
              <button
                type="button"
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {!isAuthenticated ? (
              // Public mobile menu
              <>
                <Link
                  to="/submit"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Submit Report
                </Link>
                <Link
                  to="/stats"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Public Stats
                </Link>

                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login with Discord
                </Link>
              </>
            ) : (
              // Authenticated mobile menu
              <>
                {navigationItems.map((item) => {
                  const Icon = item.current ? item.activeIcon : item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        item.current
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
                
                {/* Mobile user info */}
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={getUserAvatarUrl()}
                        alt={getUserDisplayName()}
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{getUserDisplayName()}</div>
                      <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getRoleColor(user?.role)}`}>
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Close dropdowns when clicking outside */}
      {(isProfileMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;