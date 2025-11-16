export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'top-center' | 'bottom-center';
}

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  timestamp: number;
}

// In-memory toast store
let toastContainer: HTMLDivElement | null = null;
let toasts: Toast[] = [];

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return `<svg class="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>`;
    case 'error':
      return `<svg class="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>`;
    case 'warning':
      return `<svg class="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>`;
    case 'info':
      return `<svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`;
  }
};

const getToastColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-l-4 border-green-600';
    case 'error':
      return 'bg-red-50 border-l-4 border-red-600';
    case 'warning':
      return 'bg-orange-50 border-l-4 border-orange-600';
    case 'info':
      return 'bg-blue-50 border-l-4 border-blue-600';
  }
};

export const AppToast = {
  success: (message: string, options?: ToastOptions) => {
    showToast('success', message, options);
  },

  error: (message: string, options?: ToastOptions) => {
    showToast('error', message, options);
  },

  warning: (message: string, options?: ToastOptions) => {
    showToast('warning', message, options);
  },

  info: (message: string, options?: ToastOptions) => {
    showToast('info', message, options);
  },
};

const showToast = (
  type: ToastType,
  message: string,
  options: ToastOptions = {}
) => {
  const { duration = 3000 } = options;
  const id = `${type}-${Date.now()}-${Math.random()}`;

  // Initialize container if not exists
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toastElement = document.createElement('div');
  toastElement.className = `${getToastColor(type)} rounded-lg p-4 shadow-lg flex items-start gap-3 max-w-sm animate-slideUp`;
  toastElement.style.animation = 'slideUp 0.3s ease-out';

  const iconElement = document.createElement('div');
  iconElement.className = 'flex-shrink-0 mt-0.5';
  iconElement.innerHTML = getToastIcon(type);

  const messageElement = document.createElement('div');
  messageElement.className =
    'flex-1 text-sm font-medium text-gray-900 leading-relaxed';
  messageElement.textContent = message;

  const closeElement = document.createElement('button');
  closeElement.className =
    'flex-shrink-0 text-gray-400 hover:text-gray-600 transition';
  closeElement.innerHTML = `
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeElement.onclick = () => removeToast(id);

  toastElement.appendChild(iconElement);
  toastElement.appendChild(messageElement);
  toastElement.appendChild(closeElement);
  toastElement.id = id;

  toastContainer.appendChild(toastElement);

  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, duration);

  // Add animation styles if not exists
  if (!document.querySelector('style[data-toast-animations]')) {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-toast-animations', '');
    styleElement.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-slideUp {
        animation: slideUp 0.3s ease-out;
      }
    `;
    document.head.appendChild(styleElement);
  }
};

const removeToast = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.style.animation = 'slideUp 0.3s ease-out reverse';
    setTimeout(() => {
      element.remove();
    }, 300);
  }
  toasts = toasts.filter((t) => t.id !== id);
};
