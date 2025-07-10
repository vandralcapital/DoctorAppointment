import React, { useState } from 'react';

const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className = '', 
  fallbackColor = 'blue',
  showFallback = true 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl'
  };

  const colorClasses = {
    blue: 'bg-blue-200 text-blue-800',
    green: 'bg-green-200 text-green-800',
    purple: 'bg-purple-200 text-purple-800',
    red: 'bg-red-200 text-red-800',
    yellow: 'bg-yellow-200 text-yellow-800',
    gray: 'bg-gray-200 text-gray-800'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const shouldShowImage = src && !imageError && showFallback;
  const initials = getInitials(name || alt);

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden flex items-center justify-center font-bold`}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${colorClasses[fallbackColor]}`}>
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar; 