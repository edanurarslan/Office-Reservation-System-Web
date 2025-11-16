import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, User, LogOut, Bell, Settings } from 'lucide-react';
import { UserRole } from '../../types';

const mockNotifications = [
  { id: 1, text: 'Yeni rezervasyonunuz onaylandı.', date: '2025-10-29' },
  { id: 2, text: 'Ofis kuralları güncellendi.', date: '2025-10-28' },
  { id: 3, text: 'Rezervasyonunuz iptal edildi.', date: '2025-10-25' },
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
          style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', textDecoration: 'none' }}
        >
          <div
            style={{
              background: '#6366f1',
              padding: '0.5rem',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building style={{ width: '28px', height: '28px', color: '#fff' }} />
          </div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6366f1' }}>
              Ofis Yönetim
            </span>
            <span style={{ fontSize: '0.9rem', color: '#818cf8', display: 'block', lineHeight: '1' }}>
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
              top: '48px',
              right: '0',
              background: '#fff',
              boxShadow: '0 4px 24px #6366f133',
              borderRadius: '1rem',
              minWidth: '280px',
              zIndex: 10,
            }}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid #e0e7ff', fontWeight: 600, color: '#6366f1' }}>
              Bildirimler
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
              {mockNotifications.length === 0 ? (
                <li style={{ padding: '1rem', color: '#818cf8' }}>Henüz bildiriminiz yok.</li>
              ) : (
                mockNotifications.map((n) => (
                  <li
                    key={n.id}
                    style={{
                      padding: '0.8rem 1rem',
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: '0.98rem',
                      color: '#312e81',
                    }}
                  >
                    <div>{n.text}</div>
                    <div style={{ fontSize: '0.85rem', color: '#818cf8' }}>{n.date}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, color: '#6366f1', fontSize: '0.95rem' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#818cf8' }}>{user?.email}</div>
        </div>

        <span className="navbar-role-badge">{getRoleDisplayName(user?.role)}</span>

        <Link to={getProfileLink()} className="navbar-btn" title="Profil">
          <User style={{ width: '20px', height: '20px' }} />
        </Link>

        <Link to={getSettingsLink()} className="navbar-btn" title="Ayarlar">
          <Settings style={{ width: '20px', height: '20px' }} />
        </Link>

        <button onClick={() => logout()} className="navbar-btn hover:bg-red-50" title="Çıkış Yap">
          <LogOut style={{ width: '20px', height: '20px', color: '#ef4444' }} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;