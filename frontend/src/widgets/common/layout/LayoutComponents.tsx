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
    style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(139, 92, 246, 0.1)',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: onClick ? 'pointer' : 'default'
    }}
    className={className}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.15)';
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.08)';
      }
    }}
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
    style={{
      background: 'rgba(255,255,255,0.98)',
      borderRadius: '1rem',
      border: '1px solid rgba(139, 92, 246, 0.1)',
      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.06)',
      transition: 'all 0.25s ease'
    }}
    className={className}
  >
    {title && (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(139, 92, 246, 0.08)',
        padding: '1.25rem 1.5rem'
      }}>
        <h3 style={{ 
          fontSize: '1.05rem', 
          fontWeight: 700, 
          margin: 0,
          background: 'linear-gradient(135deg, #6b21a8, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>{title}</h3>
        {headerAction}
      </div>
    )}
    <div style={{ padding: title ? '1.5rem' : '0' }}>{children}</div>
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
  blue: { bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: 'rgba(59, 130, 246, 0.2)', text: '#2563eb', icon: '#3b82f6' },
  green: { bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: 'rgba(34, 197, 94, 0.2)', text: '#16a34a', icon: '#22c55e' },
  purple: { bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: 'rgba(139, 92, 246, 0.2)', text: '#7c3aed', icon: '#8b5cf6' },
  orange: { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: 'rgba(249, 115, 22, 0.2)', text: '#ea580c', icon: '#f97316' },
  red: { bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: 'rgba(239, 68, 68, 0.2)', text: '#dc2626', icon: '#ef4444' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = 'purple',
  trend,
  className = '',
}) => {
  const colors = colorMap[color];

  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '1rem',
      padding: '1.5rem',
      transition: 'all 0.25s ease',
      cursor: 'default'
    }} className={className}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = `0 8px 25px ${colors.border}`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500, marginBottom: '0.625rem', margin: 0 }}>{label}</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: colors.text, margin: '0.5rem 0 0 0' }}>{value}</p>
          {trend && (
            <p style={{ 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              marginTop: '0.625rem', 
              margin: '0.5rem 0 0 0',
              color: trend.isPositive ? '#16a34a' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ fontSize: '1rem' }}>{trend.isPositive ? '↑' : '↓'}</span> 
              {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div style={{ 
            fontSize: '1.75rem', 
            color: colors.icon, 
            opacity: 0.7,
            background: 'rgba(255,255,255,0.5)',
            padding: '0.5rem',
            borderRadius: '0.75rem'
          }}>
            {icon}
          </div>
        )}
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
      background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 30%, #c4b5fd 60%, #d8b4fe 100%)', 
      borderRadius: '1.25rem', 
      padding: '2rem 2.5rem', 
      marginBottom: '1.75rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(139, 92, 246, 0.2), 0 4px 15px rgba(139, 92, 246, 0.12)'
    }}
  >
    {/* Dekoratif Daireler */}
    <div style={{ 
      position: 'absolute', 
      top: '-60px', 
      right: '-40px', 
      width: '200px', 
      height: '200px', 
      background: 'rgba(255,255,255,0.08)', 
      borderRadius: '50%' 
    }} />
    <div style={{ 
      position: 'absolute', 
      bottom: '-40px', 
      left: '20%', 
      width: '120px', 
      height: '120px', 
      background: 'rgba(255,255,255,0.06)', 
      borderRadius: '50%' 
    }} />
    <div style={{ 
      position: 'absolute', 
      top: '20px', 
      left: '60%', 
      width: '60px', 
      height: '60px', 
      background: 'rgba(255,255,255,0.04)', 
      borderRadius: '50%' 
    }} />
    <div style={{ 
      position: 'absolute', 
      bottom: '15px', 
      right: '25%', 
      width: '40px', 
      height: '40px', 
      background: 'rgba(255,255,255,0.05)', 
      borderRadius: '50%' 
    }} />
    
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.125rem' }}>
        {icon && (
          <div style={{ 
            background: 'rgba(255,255,255,0.18)', 
            padding: '0.875rem', 
            borderRadius: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            {icon}
          </div>
        )}
        <div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 800, 
            color: 'white', 
            margin: 0,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(0,0,0,0.15)'
          }}>
            {title}
          </h1>
          {description && (
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '0.95rem', 
              margin: '0.5rem 0 0 0',
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div style={{ marginTop: '0.25rem' }}>{action}</div>}
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
