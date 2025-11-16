import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
  overlay?: boolean;
}

// App Loading Spinner (default - centered)
export const AppLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = '',
  overlay = false,
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-indigo-200"></div>
        <div className="absolute inset-0 rounded-full border-2 border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Inline Loading Spinner (small, inline)
export const InlineLoadingSpinner: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`w-4 h-4 relative ${className}`}>
    <div className="absolute inset-0 rounded-full border-2 border-indigo-200"></div>
    <div className="absolute inset-0 rounded-full border-2 border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
  </div>
);

// Full-screen Loading Overlay
export const AppLoadingOverlay: React.FC<{ message?: string }> = ({
  message = 'Yükleniyor...',
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
      <div className="w-12 h-12 relative">
        <div className="absolute inset-0 rounded-full border-3 border-indigo-200"></div>
        <div className="absolute inset-0 rounded-full border-3 border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
      </div>
      <p className="text-gray-700 font-medium">{message}</p>
    </div>
  </div>
);

// Circular Progress Indicator
export const ProgressCircular: React.FC<{
  value: number;
  size?: 'small' | 'medium' | 'large';
  label?: string;
}> = ({ value, size = 'medium', label }) => {
  const sizeMap = {
    small: { outer: 'w-12 h-12', text: 'text-xs' },
    medium: { outer: 'w-20 h-20', text: 'text-sm' },
    large: { outer: 'w-32 h-32', text: 'text-lg' },
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`${sizeMap[size].outer} relative flex items-center justify-center`}>
      <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="50%"
          cy="50%"
          r="45"
          fill="none"
          stroke="#E0E7FF"
          strokeWidth="4"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45"
          fill="none"
          stroke="#6366F1"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.35s' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className={`${sizeMap[size].text} font-bold text-indigo-600`}>
          {value}%
        </div>
        {label && <div className="text-xs text-gray-600">{label}</div>}
      </div>
    </div>
  );
};

// Linear Progress Bar
export const LinearLoadingBar: React.FC<{
  value: number;
  label?: string;
  animated?: boolean;
}> = ({ value, label, animated = true }) => (
  <div className="w-full">
    {label && <p className="text-sm text-gray-600 mb-2">{label}</p>}
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r from-indigo-600 to-indigo-400 ${
          animated ? 'animate-pulse' : ''
        }`}
        style={{ width: `${value}%`, transition: 'width 0.35s' }}
      ></div>
    </div>
    <p className="text-xs text-gray-600 text-right mt-1">{value}%</p>
  </div>
);

// Skeleton Loading Animation
export const SkeletonLoadingAnimation: React.FC<{
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}> = ({ width = 'w-full', height = 'h-4', count = 3, className = '' }) => (
  <div className={className}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`${width} ${height} bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded mb-4 animate-pulse`}
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        }}
      ></div>
    ))}
  </div>
);

// Shimmer animation keyframes (add to global CSS)
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

// Add shimmer styles to document if not exists
if (typeof document !== 'undefined' && !document.querySelector('[data-shimmer-styles]')) {
  const style = document.createElement('style');
  style.setAttribute('data-shimmer-styles', '');
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}
