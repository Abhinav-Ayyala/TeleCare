import React from 'react';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, actionText, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200 border-dashed ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 mb-6 max-w-sm">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionText}
        </Button>
      )}
    </div>
  );
}
