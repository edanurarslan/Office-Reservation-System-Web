import React, { useEffect, useState } from 'react';

// AnimatedCard - Card with entrance animation
interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  className = '',
  style = {},
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay + 100);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out, box-shadow 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  );
};

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

// PageContainer - Main page wrapper with slide-up animation
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
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`mx-auto ${maxWidthMap[maxWidth]} px-4 py-8 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      {children}
    </div>
  );
};

// PageHeader - Page title and description with modern gradient design
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className = '',
  icon,
}) => (
  <div 
    className={className}
    style={{ 
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)', 
      borderRadius: '1.5rem', 
      padding: '2rem 2.5rem', 
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)'
    }}
  >
    {/* Dekoratif Daireler */}
    <div style={{ 
      position: 'absolute', 
      top: '-50px', 
      right: '-50px', 
      width: '180px', 
      height: '180px', 
      background: 'rgba(255,255,255,0.1)', 
      borderRadius: '50%' 
    }} />
    <div style={{ 
      position: 'absolute', 
      bottom: '-30px', 
      left: '25%', 
      width: '100px', 
      height: '100px', 
      background: 'rgba(255,255,255,0.08)', 
      borderRadius: '50%' 
    }} />
    <div style={{ 
      position: 'absolute', 
      top: '15px', 
      left: '55%', 
      width: '50px', 
      height: '50px', 
      background: 'rgba(255,255,255,0.05)', 
      borderRadius: '50%' 
    }} />
    
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {icon && (
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '0.875rem', 
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            {icon}
          </div>
        )}
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 800, 
            color: 'white', 
            margin: 0,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {title}
          </h1>
          {description && (
            <p style={{ 
              color: 'rgba(255,255,255,0.85)', 
              fontSize: '1rem', 
              margin: '0.5rem 0 0 0',
              fontWeight: 500
            }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
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
