import React, { useState } from 'react';
import { PageContainer, PageHeader, PrimaryButton } from '../../widgets';
import { Bell, CheckCircle, Clock, Check } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Rezervasyon Onaylandı',
      message: 'A101 masa için yapılan rezervasyonunuz onaylanmıştır.',
      type: 'success',
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      title: 'Yeni Özellikleri Keşfedin',
      message: 'Yeni QR tarama özelliği artık kullanılabilir.',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      title: 'Rezervasyonu Hatırlatma',
      message: 'Yarın saat 14:00\'de yapılacak B202 masa rezervasyonunuz var.',
      type: 'warning',
      read: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4',
      title: 'Sistem Bakımı',
      message: 'Sistem bakımından dolayı 23:00 - 01:00 arasında hizmet kesilecektir.',
      type: 'error',
      read: true,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  const getTypeConfig = (type: string) => {
    const typeConfig: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
      success: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle style={{ width: '20px', height: '20px' }} /> },
      info: { bg: '#dbeafe', color: '#0c4a6e', icon: <Bell style={{ width: '20px', height: '20px' }} /> },
      warning: { bg: '#fef3c7', color: '#92400e', icon: <Clock style={{ width: '20px', height: '20px' }} /> },
      error: { bg: '#fee2e2', color: '#991b1b', icon: <Clock style={{ width: '20px', height: '20px' }} /> },
    };
    return typeConfig[type] || typeConfig.info;
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Şimdi';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    return `${Math.floor(seconds / 86400)} gün önce`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Bildirimler"
        description="Tüm bildirimlerinizi görüntüleyin ve yönetin."
      />

      {unreadCount > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#0c4a6e', fontSize: '1rem' }}>{unreadCount} Okunmamış Bildirim</div>
            <div style={{ color: '#0369a1', fontSize: '0.9rem' }}>Lütfen bildirimlerinizi kontrol edin</div>
          </div>
          <PrimaryButton onClick={handleMarkAllAsRead} size="medium" style={{ background: '#0369a1' }}>
            <Check style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
            Hepsini Oku
          </PrimaryButton>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '3rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(31,38,135,0.10)' }}>
            <Bell style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>Bildirim Yok</div>
            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Tüm bildirimler temizlenmiştir</div>
          </div>
        ) : (
          notifications.map(notification => {
            const typeConfig = getTypeConfig(notification.type);
            return (
              <div
                key={notification.id}
                style={{
                  background: '#fff',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 8px 32px rgba(31,38,135,0.10)',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  borderLeft: `4px solid ${typeConfig.color}`,
                  opacity: notification.read ? 0.7 : 1,
                }}
              >
                <div style={{ ...typeConfig, width: '40px', height: '40px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {typeConfig.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 700, color: '#312e81', fontSize: '0.95rem' }}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%' }} />
                    )}
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    {notification.message}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    {getTimeAgo(notification.timestamp)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: '#eef2ff',
                        border: '1px solid #c7d2fe',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        color: '#312e81',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      Oku
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      color: '#991b1b',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageContainer>
  );
};

export default NotificationsPage;
