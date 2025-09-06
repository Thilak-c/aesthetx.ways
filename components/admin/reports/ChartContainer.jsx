import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const ChartContainer = ({ 
  title, 
  children, 
  loading = false, 
  error = null,
  className = "",
  actions = null 
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {actions && <div className="opacity-50">{actions}</div>}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <FiRefreshCw className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
            <p className="text-gray-600">Loading chart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="text-red-500 text-4xl">⚠️</div>
            <p className="text-red-600">Error loading chart</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && <div>{actions}</div>}
      </div>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
