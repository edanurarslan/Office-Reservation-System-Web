import React from 'react';

// Shimmer animation helper
const shimmerAnimation = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
`;

// Ensure shimmer styles are added once
if (typeof document !== 'undefined' && !document.querySelector('[data-skeleton-shimmer]')) {
  const style = document.createElement('style');
  style.setAttribute('data-skeleton-shimmer', '');
  style.textContent = shimmerAnimation;
  document.head.appendChild(style);
}

const shimmerClasses =
  'bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-[length:1000px_100%] animate-pulse';

// ShimmerLoading - Generic shimmer effect
export const ShimmerLoading: React.FC<{
  width?: string;
  height?: string;
  className?: string;
}> = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`${width} ${height} ${shimmerClasses} rounded ${className}`}></div>
);

// SkeletonCard - Card placeholder
export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-lg p-4 border border-gray-200 space-y-3"
      >
        <ShimmerLoading height="h-6" />
        <ShimmerLoading height="h-4" width="w-3/4" />
        <ShimmerLoading height="h-4" width="w-1/2" />
      </div>
    ))}
  </div>
);

// SkeletonListItem - List item placeholder
export const SkeletonListItem: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <ShimmerLoading width="w-12 h-12" className="rounded-full" />
        <div className="flex-1 space-y-2">
          <ShimmerLoading height="h-4" width="w-1/3" />
          <ShimmerLoading height="h-3" width="w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

// SkeletonButton - Button placeholder
export const SkeletonButton: React.FC<{
  size?: 'small' | 'medium' | 'large';
  width?: string;
}> = ({ size = 'medium', width = 'w-full' }) => {
  const heights = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-12',
  };

  return <ShimmerLoading width={width} height={heights[size]} className="rounded-lg" />;
};

// SkeletonTextField - Input field placeholder
export const SkeletonTextField: React.FC<{ count?: number }> = ({ count = 2 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-2">
        <ShimmerLoading height="h-4" width="w-1/4" />
        <ShimmerLoading height="h-10" className="rounded-lg" />
      </div>
    ))}
  </div>
);

// SkeletonTableRow - Table row placeholder
export const SkeletonTableRow: React.FC<{
  cols?: number;
  rows?: number;
}> = ({ cols = 4, rows = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="flex gap-3 p-3 bg-white rounded border border-gray-200">
        {Array.from({ length: cols }).map((_, colIdx) => (
          <ShimmerLoading
            key={colIdx}
            height="h-4"
            width={colIdx === 0 ? 'w-1/4' : 'w-1/3'}
          />
        ))}
      </div>
    ))}
  </div>
);

// SkeletonDashboardCard - Dashboard stat card skeleton
export const SkeletonDashboardCard: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <ShimmerLoading height="h-4" width="w-2/3" className="mb-3" />
            <ShimmerLoading height="h-8" width="w-1/2" />
          </div>
          <ShimmerLoading width="w-12 h-12" className="rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// SkeletonGrid - Grid placeholder
export const SkeletonGrid: React.FC<{
  cols?: number;
  items?: number;
}> = ({ cols = 3, items = 6 }) => (
  <div className={`grid grid-cols-${cols} gap-4`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
        <ShimmerLoading width="w-full" height="h-40" className="rounded mb-3" />
        <ShimmerLoading height="h-5" className="mb-2" />
        <ShimmerLoading height="h-4" width="w-2/3" />
      </div>
    ))}
  </div>
);

// Composite: SkeletonPage - Full page skeleton
export const SkeletonPage: React.FC = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-3">
      <ShimmerLoading height="h-8" width="w-1/3" />
      <ShimmerLoading height="h-4" width="w-2/3" />
    </div>
    <SkeletonDashboardCard count={4} />
    <div className="space-y-3">
      <ShimmerLoading height="h-6" width="w-1/4" />
      <SkeletonListItem count={3} />
    </div>
  </div>
);
