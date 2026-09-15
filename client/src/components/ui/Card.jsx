import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={`text-xl font-semibold text-slate-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pt-4 border-t border-slate-100 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
}
