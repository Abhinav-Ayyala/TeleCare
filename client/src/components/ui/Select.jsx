import React, { forwardRef } from 'react';

const Select = forwardRef(({ className = '', label, error, options = [], ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <select
        ref={ref}
        className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm px-4 py-2 border outline-none transition-shadow bg-white
          ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300'}
          ${className}`}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
