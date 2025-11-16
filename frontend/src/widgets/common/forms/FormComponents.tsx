import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

// Text Input Component
interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled';
  success?: boolean;
  helperText?: string;
  maxLength?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  disabled = false,
  required = false,
  size = 'medium',
  variant = 'outlined',
  success = false,
  helperText,
  maxLength,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1.5 text-sm';
      case 'large':
        return 'px-4 py-3 text-lg';
      case 'medium':
      default:
        return 'px-3 py-2 text-base';
    }
  };

  const getVariantClasses = () => {
    if (error) {
      return `${variant === 'outlined' 
        ? 'border-2 border-red-500 bg-white' 
        : 'bg-red-50 border-2 border-red-300'} focus:outline-none focus:ring-2 focus:ring-red-400`;
    }
    if (success) {
      return `${variant === 'outlined' 
        ? 'border-2 border-green-500 bg-white' 
        : 'bg-green-50 border-2 border-green-300'} focus:outline-none focus:ring-2 focus:ring-green-400`;
    }
    return `${variant === 'outlined' 
      ? 'border-2 border-indigo-300 bg-white' 
      : 'bg-indigo-50 border-2 border-indigo-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500`;
  };

  const displayType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#312e81',
          fontSize: '0.95rem',
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={displayType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full rounded-lg transition-all ${getSizeClasses()} ${getVariantClasses()} ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          style={{
            fontFamily: 'inherit',
          }}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#818cf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
            }}
          >
            {showPassword ? (
              <EyeOff style={{ width: '18px', height: '18px' }} />
            ) : (
              <Eye style={{ width: '18px', height: '18px' }} />
            )}
          </button>
        )}
        {success && (
          <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
            <CheckCircle2 style={{ width: '20px', height: '20px', color: '#22c55e' }} />
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
          </div>
        )}
      </div>
      {error && <div style={{ marginTop: '0.35rem', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
      {helperText && !error && <div style={{ marginTop: '0.35rem', color: '#818cf8', fontSize: '0.85rem' }}>{helperText}</div>}
      {maxLength && (
        <div style={{ marginTop: '0.35rem', color: '#818cf8', fontSize: '0.8rem', textAlign: 'right' }}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

// Select/Dropdown Component
interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  placeholder?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  size = 'medium',
  placeholder,
  helperText,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1.5 text-sm';
      case 'large':
        return 'px-4 py-3 text-lg';
      case 'medium':
      default:
        return 'px-3 py-2 text-base';
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#312e81',
          fontSize: '0.95rem',
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-lg border-2 transition-all ${getSizeClasses()} ${
          error ? 'border-red-500 bg-white' : 'border-indigo-300 bg-white'
        } focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-400' : 'focus:ring-indigo-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        style={{
          fontFamily: 'inherit',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236366f1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1rem',
          paddingRight: '2.5rem',
          appearance: 'none',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div style={{ marginTop: '0.35rem', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
      {helperText && !error && <div style={{ marginTop: '0.35rem', color: '#818cf8', fontSize: '0.85rem' }}>{helperText}</div>}
    </div>
  );
};

// Checkbox Component
interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  helperText,
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{
            width: '18px',
            height: '18px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            accentColor: '#6366f1',
            borderRadius: '0.25rem',
          }}
        />
        {label && (
          <label style={{
            fontWeight: 500,
            color: '#312e81',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}>
            {label}
          </label>
        )}
      </div>
      {error && <div style={{ marginTop: '0.35rem', marginLeft: '1.5rem', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
      {helperText && !error && <div style={{ marginTop: '0.35rem', marginLeft: '1.5rem', color: '#818cf8', fontSize: '0.85rem' }}>{helperText}</div>}
    </div>
  );
};

// Radio Button Component
interface RadioOption {
  value: string | number;
  label: string;
}

interface RadioProps {
  label?: string;
  options: RadioOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  direction?: 'horizontal' | 'vertical';
}

export const Radio: React.FC<RadioProps> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  direction = 'vertical',
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <div style={{
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#312e81',
          fontSize: '0.95rem',
        }}>
          {label}
        </div>
      )}
      <div style={{
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap: direction === 'vertical' ? '0.75rem' : '1.5rem',
      }}>
        {options.map((opt) => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <input
              type="radio"
              name={label}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              style={{
                width: '18px',
                height: '18px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                accentColor: '#6366f1',
              }}
            />
            <span style={{ fontWeight: 500, color: '#312e81' }}>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <div style={{ marginTop: '0.35rem', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
      {helperText && !error && <div style={{ marginTop: '0.35rem', color: '#818cf8', fontSize: '0.85rem' }}>{helperText}</div>}
    </div>
  );
};

// Toggle Component
interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  color?: 'indigo' | 'green' | 'red' | 'blue';
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  description,
  color = 'indigo',
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'red':
        return 'bg-red-500';
      case 'blue':
        return 'bg-blue-500';
      case 'indigo':
      default:
        return 'bg-indigo-500';
    }
  };

  return (
    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        style={{
          position: 'relative',
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          background: checked ? undefined : '#e5e7eb',
          backgroundColor: checked ? undefined : '#e5e7eb',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        }}
        className={checked && !disabled ? getColorClasses() : ''}
      >
        <div
          style={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.3s',
            left: checked ? '2px' : '22px',
          }}
        />
      </button>
      {label && (
        <div>
          <div style={{ fontWeight: 600, color: '#312e81' }}>{label}</div>
          {description && <div style={{ fontSize: '0.85rem', color: '#818cf8' }}>{description}</div>}
        </div>
      )}
    </div>
  );
};

// Date Picker Component
interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  helperText?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  min,
  max,
  helperText,
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#312e81',
          fontSize: '0.95rem',
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full rounded-lg border-2 px-3 py-2 text-base transition-all ${
          error ? 'border-red-500 bg-white' : 'border-indigo-300 bg-white'
        } focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-400' : 'focus:ring-indigo-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        style={{
          fontFamily: 'inherit',
        }}
      />
      {error && <div style={{ marginTop: '0.35rem', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
      {helperText && !error && <div style={{ marginTop: '0.35rem', color: '#818cf8', fontSize: '0.85rem' }}>{helperText}</div>}
    </div>
  );
};

// Textarea Component
interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 3,
  maxLength,
  helperText,
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#312e81',
          fontSize: '0.95rem',
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full rounded-lg border-2 px-3 py-2 text-base transition-all resize-vertical ${
          error ? 'border-red-500 bg-white' : 'border-indigo-300 bg-white'
        } focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-400' : 'focus:ring-indigo-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        style={{
          fontFamily: 'inherit',
          minHeight: `${rows * 1.5 + 0.5}rem`,
        }}
      />
      {error && <div style={{ marginTop: '0.35rem', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
      {helperText && !error && <div style={{ marginTop: '0.35rem', color: '#818cf8', fontSize: '0.85rem' }}>{helperText}</div>}
      {maxLength && (
        <div style={{ marginTop: '0.35rem', color: '#818cf8', fontSize: '0.8rem', textAlign: 'right' }}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};
