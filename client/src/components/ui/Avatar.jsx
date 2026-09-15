import React from 'react';

export default function Avatar({ src, initials, size = 'md', className = '', bgColor = 'bg-sky-100 text-sky-600' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${sizes[size]} ${!src && bgColor} ${className}`}>
      {src ? (
        <img src={src} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <span className="font-medium uppercase">{initials || 'U'}</span>
      )}
    </div>
  );
}
