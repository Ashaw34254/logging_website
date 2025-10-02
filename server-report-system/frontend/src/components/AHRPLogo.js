import React from 'react';

const AHRPLogo = ({ className = "h-8 w-8", showText = true, variant = "full" }) => {
  const LogoIcon = () => (
    <div className={`${className} bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <path
          d="M12 6L12.5 10.5L17 11L12.5 11.5L12 16L11.5 11.5L7 11L11.5 10.5L12 6Z"
          fill="rgba(255,255,255,0.3)"
        />
      </svg>
    </div>
  );

  if (variant === "icon") {
    return <LogoIcon />;
  }

  return (
    <div className="flex items-center space-x-3">
      <LogoIcon />
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AHRP
          </span>
          <span className="text-xs text-gray-500 -mt-1 tracking-wider">
            REPORT SYSTEM
          </span>
        </div>
      )}
    </div>
  );
};

export default AHRPLogo;