import React from 'react';

interface ProductStatsProps {
  stats: {
    stats: Array<{ _id: string; count: number }>;
    summary: {
      totalProducts: number;
      activeProducts: number;
      inactiveProducts: number;
    };
  };
}

const ProductStats: React.FC<ProductStatsProps> = ({ stats }) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'discontinued':
        return 'Discontinued';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'discontinued':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.summary.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.summary.activeProducts}</p>
            </div>
          </div>
        </div>

        {/* Inactive Products */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inactive Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.summary.inactiveProducts}</p>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status Distribution</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.stats.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {stats.stats.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow border">
          <h3 className="text-md font-medium text-gray-900 mb-3">Status Breakdown</h3>
          <div className="space-y-2">
            {stats.stats.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(stat._id)} mr-3`}></div>
                  <span className="text-sm text-gray-700">{getStatusLabel(stat._id)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({((stat.count / stats.summary.totalProducts) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductStats;
