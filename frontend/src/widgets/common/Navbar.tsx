import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, User, LogOut, Bell, Settings, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

const mockNotifications = [
  { id: 1, text: 'Yeni rezervasyonunuz onaylandı.', date: '2025-10-29', type: 'success' },
  { id: 2, text: 'Ofis kuralları güncellendi.', date: '2025-10-28', type: 'info' },
  { id: 3, text: 'Rezervasyonunuz iptal edildi.', date: '2025-10-25', type: 'warning' },
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case UserRole.Employee:
        return 'Çalışan';
      case UserRole.Manager:
        return 'Yönetmen';
      case UserRole.Admin:
        return 'Yönetici';
      default:
        return role || '';
    }
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case UserRole.Admin:
        return '/admin/overview';
      case UserRole.Manager:
        return '/manager/dashboard';
      case UserRole.Employee:
      default:
        return '/employee/dashboard';
    }
  };

  const getProfileLink = () => {
    switch (user?.role) {
      case UserRole.Admin:
        return '/admin/users';
      case UserRole.Manager:
        return '/manager/users';
      case UserRole.Employee:
      default:
        return '/employee/profile';
    }
  };

  const getSettingsLink = () => {
    switch (user?.role) {
      case UserRole.Admin:
        return '/admin/approval';
      case UserRole.Manager:
        return '/manager/notifications';
      case UserRole.Employee:
      default:
        return '/employee/settings';
    }
  };

  return (
    <nav className="navbar-glass">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          to={getDashboardLink()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none' }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
              padding: '0.625rem',
              borderRadius: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.35)',
            }}
          >
            <Building2 style={{ width: '26px', height: '26px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Ofis Yönetim
              </span>
              <Sparkles style={{ width: '14px', height: '14px', color: '#a855f7' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, letterSpacing: '0.05em' }}>
              Sistemi
            </span>
          </div>
        </Link>
      </div>

      <div className="navbar-user-info" style={{ position: 'relative' }}>
        <button
          className="navbar-btn"
          style={{ position: 'relative' }}
          onClick={() => setShowNotifications((v) => !v)}
        >
          <Bell style={{ width: '20px', height: '20px' }} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
            }}
          ></span>
        </button>

        {showNotifications && (
          <div
            style={{
              position: 'absolute',
              top: '52px',
              right: '0',
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 40px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(139, 92, 246, 0.1)',
              borderRadius: '1rem',
              minWidth: '320px',
              zIndex: 50,
              border: '1px solid rgba(139, 92, 246, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              padding: '1rem 1.25rem', 
              borderBottom: '1px solid rgba(139, 92, 246, 0.1)', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Bell style={{ width: '16px', height: '16px' }} />
              Bildirimler
              <span style={{
                marginLeft: 'auto',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                color: 'white',
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '0.5rem',
                fontWeight: 600
              }}>
                {mockNotifications.length}
              </span>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '320px', overflowY: 'auto' }}>
              {mockNotifications.length === 0 ? (
                <li style={{ padding: '1.5rem', color: '#9ca3af', textAlign: 'center' }}>
                  Henüz bildiriminiz yok.
                </li>
              ) : (
                mockNotifications.map((n) => (
                  <li
                    key={n.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid rgba(139, 92, 246, 0.05)',
                      fontSize: '0.9rem',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 500 }}>{n.text}</div>
                    <div style={{ fontSize: '0.75rem', color: '#a855f7', marginTop: '0.35rem' }}>{n.date}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        <div style={{ textAlign: 'right', marginRight: '0.25rem' }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '0.9rem',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user?.email}</div>
        </div>

        <span className="navbar-role-badge">{getRoleDisplayName(user?.role)}</span>

        <Link to={getProfileLink()} className="navbar-btn" title="Profil">
          <User style={{ width: '18px', height: '18px' }} />
        </Link>

        <Link to={getSettingsLink()} className="navbar-btn" title="Ayarlar">
          <Settings style={{ width: '18px', height: '18px' }} />
        </Link>

        <button 
          onClick={() => logout()} 
          className="navbar-btn" 
          title="Çıkış Yap"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            borderColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          <LogOut style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;