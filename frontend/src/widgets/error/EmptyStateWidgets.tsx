import React from 'react';
import {
  Package,
  Search,
  AlertCircle,
  Database,
  Wifi,
  Lock,
  Wrench,
  WifiOff,
} from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

// Generic Empty State
export const EmptyStateWidget: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = <Package className="w-16 h-16 text-gray-400" />,
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-gray-600 text-sm mb-6">{description}</p>}
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
      >
        {actionText}
      </button>
    )}
  </div>
);

// Empty List State
export const EmptyListState: React.FC<EmptyStateProps> = (props) => (
  <EmptyStateWidget
    icon={<Package className="w-16 h-16 text-gray-400" />}
    {...props}
  />
);

// No Search Results
export const EmptySearchState: React.FC<{
  query: string;
  onReset?: () => void;
}> = ({ query, onReset }) => (
  <EmptyStateWidget
    title="Sonuç Bulunamadı"
    description={`"${query}" için herhangi bir öğe bulunamadı`}
    actionText={onReset ? 'Aramayı Sıfırla' : undefined}
    onAction={onReset}
    icon={<Search className="w-16 h-16 text-gray-400" />}
  />
);

// Error State
export const ErrorStateWidget: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  title = 'Bir Hata Oluştu',
  message = 'Lütfen daha sonra tekrar deneyin',
  onRetry,
}) => (
  <EmptyStateWidget
    title={title}
    description={message}
    actionText={onRetry ? 'Tekrar Dene' : undefined}
    onAction={onRetry}
    icon={<AlertCircle className="w-16 h-16 text-red-400" />}
  />
);

// No Data State
export const NoDataState: React.FC<{ title?: string }> = ({
  title = 'Veri Bulunamadı',
}) => (
  <EmptyStateWidget
    title={title}
    icon={<Database className="w-16 h-16 text-gray-400" />}
  />
);

// No Network State
export const NoNetworkState: React.FC<{ onRetry?: () => void }> = ({
  onRetry,
}) => (
  <EmptyStateWidget
    title="İnternet Bağlantısı Yok"
    description="Lütfen bağlantınızı kontrol edin ve tekrar deneyin"
    actionText={onRetry ? 'Tekrar Dene' : undefined}
    onAction={onRetry}
    icon={<Wifi className="w-16 h-16 text-orange-400" />}
  />
);

// Unauthorized State
export const UnauthorizedState: React.FC<{ onLogin?: () => void }> = ({
  onLogin,
}) => (
  <EmptyStateWidget
    title="Yetkisiz Erişim"
    description="Bu sayfaya erişim izniniz yok. Lütfen giriş yapın."
    actionText={onLogin ? 'Giriş Yap' : undefined}
    onAction={onLogin}
    icon={<Lock className="w-16 h-16 text-red-400" />}
  />
);

// Maintenance State
export const MaintenanceState: React.FC<{ message?: string }> = ({
  message = 'Sistem bakımı nedeniyle geçici olarak kullanılamıyor',
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-yellow-50 rounded-lg border-2 border-yellow-200">
    <Wrench className="w-16 h-16 text-yellow-600 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bakımda</h3>
    <p className="text-gray-600 text-sm">{message}</p>
    <p className="text-xs text-gray-500 mt-4">Yakında yeniden açılacak...</p>
  </div>
);

// Offline State
export const OfflineState: React.FC<{ message?: string }> = ({
  message = 'Çevrimdışı Moddesiniz',
}) => (
  <div className="flex flex-col items-center justify-center py-8 px-6 text-center bg-gray-100 rounded-lg border border-gray-300">
    <WifiOff className="w-12 h-12 text-gray-600 mb-3" />
    <p className="text-gray-900 font-medium text-sm">{message}</p>
    <p className="text-gray-600 text-xs mt-2">
      İnternet bağlantısı olmadan sınırlı işlevler kullanılabilir
    </p>
  </div>
);
