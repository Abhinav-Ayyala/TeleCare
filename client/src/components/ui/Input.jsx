import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = '', label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm px-4 py-2 border outline-none transition-shadow
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300'}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
