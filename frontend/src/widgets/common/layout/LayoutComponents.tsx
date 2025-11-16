import React from 'react';

// GlassCard - Glassmorphism card component
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white bg-opacity-90 backdrop-blur-md border border-white border-opacity-20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${className}`}
  >
    {children}
  </div>
);

// DashboardCard - Card for dashboard layout
interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className = '',
  headerAction,
}) => (
  <div
    className={`bg-white rounded-xl border border-indigo-100 shadow-md hover:shadow-lg transition-all ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between border-b border-indigo-100 p-6">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {headerAction}
      </div>
    )}
    <div className={title ? 'p-6' : ''}>{children}</div>
  </div>
);

// StatCard - Card for displaying statistics
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const colorMap = {
  blue: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', icon: '#2563eb' },
  green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: '#16a34a' },
  purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#9333ea', icon: '#9333ea' },
  orange: { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c', icon: '#ea580c' },
  red: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '#dc2626' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = 'blue',
  trend,
  className = '',
}) => {
  const colors = colorMap[color];

  return (
    <div style={{
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      padding: '1.5rem',
      ...typeof className === 'string' ? {} : {}
    }} className={className}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: 500, marginBottom: '0.5rem' }}>{label}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.text }}>{value}</p>
          {trend && (
            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem', color: trend.isPositive ? '#16a34a' : '#dc2626' }}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div style={{ fontSize: '1.875rem', color: colors.icon, opacity: 0.6 }}>{icon}</div>}
      </div>
    </div>
  );
};

// PageContainer - Main page wrapper
interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'w-full',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'lg',
  className = '',
}) => (
  <div className={`mx-auto ${maxWidthMap[maxWidth]} px-4 py-8 ${className}`}>
    {children}
  </div>
);

// PageHeader - Page title and description
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className = '',
}) => (
  <div className={`mb-8 flex items-start justify-between ${className}`}>
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && <p className="text-gray-600 text-lg">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ResponsiveGrid - Responsive grid container
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const gapMap = {
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10',
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { default: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className = '',
}) => {
  const gridClasses = `grid grid-cols-${columns.default} ${
    columns.sm ? `sm:grid-cols-${columns.sm}` : ''
  } ${columns.md ? `md:grid-cols-${columns.md}` : ''} ${
    columns.lg ? `lg:grid-cols-${columns.lg}` : ''
  } ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''} ${gapMap[gap]} ${className}`;

  return <div className={gridClasses}>{children}</div>;
};

// Flex wrapper - Flexbox utility
interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  justify?: 'start' | 'center' | 'between' | 'around' | 'end';
  items?: 'start' | 'center' | 'end' | 'stretch';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  end: 'justify-end',
};

const itemsMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  justify = 'start',
  items = 'center',
  gap = 'md',
  className = '',
}) => (
  <div
    className={`flex flex-${direction} ${justifyMap[justify]} ${itemsMap[items]} ${gapMap[gap]} ${className}`}
  >
    {children}
  </div>
);
