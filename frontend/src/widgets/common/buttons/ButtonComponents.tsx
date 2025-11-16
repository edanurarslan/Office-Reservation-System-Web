import React from 'react';
import { InlineLoadingSpinner } from '../../loading/LoadingComponents';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  children: React.ReactNode;
}

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

const baseStyles =
  'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variantStyles = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 shadow-sm',
  tertiary: 'bg-transparent text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100',
  success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg',
  warning: 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 shadow-md hover:shadow-lg',
};

const sizeStyles = {
  small: 'px-3 py-2 text-sm h-8',
  medium: 'px-6 py-2.5 text-base h-10',
  large: 'px-8 py-3 text-lg h-12',
};

// Primary Button
export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => (
  <button
    className={`${baseStyles} ${variantStyles.primary} ${sizeStyles[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Secondary Button
export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => (
  <button
    className={`${baseStyles} ${variantStyles.secondary} ${sizeStyles[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Tertiary Button (Ghost/Text Button)
export const TertiaryButton: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => (
  <button
    className={`${baseStyles} ${variantStyles.tertiary} ${sizeStyles[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Success Button
export const SuccessButton: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => (
  <button
    className={`${baseStyles} ${variantStyles.success} ${sizeStyles[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Danger Button
export const DangerButton: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => (
  <button
    className={`${baseStyles} ${variantStyles.danger} ${sizeStyles[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Warning Button
export const WarningButton: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => (
  <button
    className={`${baseStyles} ${variantStyles.warning} ${sizeStyles[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Loading Button (with loading state)
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  isLoading = false,
  loadingText = 'Yükleniyor...',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  variant = 'primary',
  className = '',
  ...props
}) => (
  <button
    className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    disabled={isLoading || disabled}
    {...props}
  >
    {isLoading ? (
      <>
        <InlineLoadingSpinner />
        <span>{loadingText}</span>
      </>
    ) : (
      children
    )}
  </button>
);

// Generic Button Component with variant support
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => (
  <button
    className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Button Group
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`flex gap-2 ${className}`}>{children}</div>
);
