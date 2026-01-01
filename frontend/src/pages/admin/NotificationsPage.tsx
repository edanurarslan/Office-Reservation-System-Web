import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PrimaryButton } from '../../widgets';
import { Send, Bell, Users, CheckCircle, AlertCircle, Info, AlertTriangle, RefreshCw, Trash2, Check } from 'lucide-react';
import apiService from '../../utils/services/api';

interface UserForNotification {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  recipientName?: string;
  recipientEmail?: string;
  senderName?: string;
}

const NotificationsPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState<'users' | 'roles'>('roles');
  
  const [users, setUsers] = useState<UserForNotification[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = [
    { id: 1, name: 'Çalışanlar', icon: '👤' },
    { id: 2, name: 'Yöneticiler', icon: '👔' },
    { id: 3, name: 'Adminler', icon: '🔑' },
  ];

  const typeOptions = [
    { value: 'info', label: 'Bilgi', icon: Info, color: '#6366f1' },
    { value: 'success', label: 'Başarı', icon: CheckCircle, color: '#22c55e' },
    { value: 'warning', label: 'Uyarı', icon: AlertTriangle, color: '#f59e0b' },
    { value: 'error', label: 'Hata', icon: AlertCircle, color: '#ef4444' },
  ];

  // Fetch users and notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, notificationsData] = await Promise.all([
          apiService.getNotificationUsers(),
          apiService.getAllNotifications()
        ]);
        setUsers(usersData);
        setNotifications(notificationsData.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Bildirim mesajı gerekli');
      return;
    }

    if (selectionMode === 'users' && selectedUsers.length === 0) {
      setError('En az bir kullanıcı seçin');
      return;
    }

    if (selectionMode === 'roles' && selectedRoles.length === 0) {
      setError('En az bir rol seçin');
      return;
    }

    setSending(true);
    setError(null);
    
    try {
      let result;
      if (selectionMode === 'users') {
        result = await apiService.sendBulkNotification({
          userIds: selectedUsers,
          title: title || 'Yeni Bildirim',
          message,
          type: notificationType
        });
      } else {
        result = await apiService.sendNotificationByRole({
          roles: selectedRoles,
          title: title || 'Yeni Bildirim',
          message,
          type: notificationType
        });
      }

      setSuccess(`Bildirim ${result.count} kişiye başarıyla gönderildi!`);
      setMessage('');
      setTitle('');
      setSelectedUsers([]);
      setSelectedRoles([]);
      
      // Refresh notifications list
      const notificationsData = await apiService.getAllNotifications();
      setNotifications(notificationsData.data || []);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('Bildirim gönderilirken hata oluştu');
    } finally {
      setSending(false);
    }
  };

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const toggleRole = (id: number) => {
    setSelectedRoles(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const getTypeIcon = (type: string) => {
    const option = typeOptions.find(t => t.value === type);
    if (!option) return <Info style={{ width: 16, height: 16 }} />;
    const Icon = option.icon;
    return <Icon style={{ width: 16, height: 16, color: option.color }} />;
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6366f1' }}>
          <RefreshCw style={{ width: 40, height: 40, animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Yükleniyor...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Bildirim Yönetimi"
        description="Kullanıcılara toplu bildirim veya duyuru gönderin."
      />

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle style={{ width: 20, height: 20 }} /> {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {success && (
        <div style={{ padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle style={{ width: 20, height: 20 }} /> {success}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Send Notification Form */}
        <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#312e81', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Send style={{ width: 18, height: 18 }} />
            Yeni Bildirim Gönder
          </h3>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Title Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>
                Başlık (Opsiyonel)
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Bildirim başlığı"
                style={{ width: '97%', padding: '0.6rem 0.75rem', borderRadius: '0.6rem', border: '1.5px solid #e5e7eb', fontSize: '0.85rem', fontFamily: 'inherit' }}
              />
            </div>

            {/* Message Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>
                Mesaj *
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Bildirim veya duyuru metni yazın..."
                required
                style={{ width: '97%', padding: '0.6rem 0.75rem', borderRadius: '0.6rem', border: '1.5px solid #e5e7eb', fontSize: '0.85rem', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {/* Type */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>
                Bildirim Türü
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {typeOptions.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setNotificationType(type.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '0.5rem',
                      border: notificationType === type.value ? `1.5px solid ${type.color}` : '1.5px solid #e5e7eb',
                      background: notificationType === type.value ? `${type.color}15` : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: notificationType === type.value ? type.color : '#6b7280'
                    }}
                  >
                    <type.icon style={{ width: 14, height: 14 }} />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Mode */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>
                Alıcı Seçimi
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => { setSelectionMode('roles'); setSelectedUsers([]); }}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '0.5rem',
                    border: selectionMode === 'roles' ? '1.5px solid #6366f1' : '1.5px solid #e5e7eb',
                    background: selectionMode === 'roles' ? '#eef2ff' : '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: selectionMode === 'roles' ? '#6366f1' : '#6b7280'
                  }}
                >
                  Role Göre
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectionMode('users'); setSelectedRoles([]); }}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '0.5rem',
                    border: selectionMode === 'users' ? '1.5px solid #6366f1' : '1.5px solid #e5e7eb',
                    background: selectionMode === 'users' ? '#eef2ff' : '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: selectionMode === 'users' ? '#6366f1' : '#6b7280'
                  }}
                >
                  Kişi Seç
                </button>
              </div>
            </div>

            {/* Role Selection */}
            {selectionMode === 'roles' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                  Roller *
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {roleOptions.map(role => (
                    <label
                      key={role.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: selectedRoles.includes(role.id) ? '2px solid #6366f1' : '2px solid #e5e7eb',
                        background: selectedRoles.includes(role.id) ? '#6366f1' : '#fff',
                        color: selectedRoles.includes(role.id) ? '#fff' : '#374151',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                        style={{ display: 'none' }}
                      />
                      <span>{role.icon}</span>
                      {role.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* User Selection */}
            {selectionMode === 'users' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                  Kullanıcılar * ({selectedUsers.length} seçili)
                </label>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.5rem' }}>
                  {users.map(user => (
                    <label
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        background: selectedUsers.includes(user.id) ? '#eef2ff' : 'transparent',
                        cursor: 'pointer',
                        marginBottom: '0.25rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user.email} • {user.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <PrimaryButton type="submit" size="large" disabled={sending} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', fontWeight: 600 }}>
              {sending ? (
                <>
                  <RefreshCw style={{ width: 18, height: 18, marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send style={{ width: 18, height: 18, marginRight: '0.5rem' }} />
                  Bildirimi Gönder
                </>
              )}
            </PrimaryButton>
          </form>
        </div>

        {/* Recent Notifications */}
        <div style={{ width: 400, background: '#fff', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', maxHeight: 600, overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#312e81', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell style={{ width: 20, height: 20 }} />
            Son Gönderilen Bildirimler
          </h3>

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <Bell style={{ width: 40, height: 40, marginBottom: '0.5rem', opacity: 0.5 }} />
              <p>Henüz bildirim gönderilmedi</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: '#f8fafc',
                    borderLeft: `4px solid ${typeOptions.find(t => t.value === notification.type)?.color || '#6366f1'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    {getTypeIcon(notification.type)}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem' }}>
                        {notification.title || 'Bildirim'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {notification.message.length > 100 ? notification.message.substring(0, 100) + '...' : notification.message}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af' }}>
                        <span>→ {notification.recipientName || notification.recipientEmail}</span>
                        <span>{new Date(notification.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    {notification.isRead && (
                      <Check style={{ width: 16, height: 16, color: '#22c55e' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageContainer>
  );
};

export default NotificationsPage;
