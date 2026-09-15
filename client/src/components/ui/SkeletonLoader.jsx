import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const elements = Array.from({ length: count });

  if (type === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {elements.map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {elements.map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
