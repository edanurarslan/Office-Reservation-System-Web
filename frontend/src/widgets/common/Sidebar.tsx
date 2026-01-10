import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building,
  QrCode,
  BarChart3,
  MapPin,
  Bell,
  Settings,
  LogOut,
  Activity,
  HardDrive,
  BookOpen,
  Shield,
  CheckSquare,
} from 'lucide-react';
import { UserRole } from '../../types';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Employee menu
  const employeeMenu = [
    {
      name: 'Dashboard',
      path: '/employee/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Rezervasyonlar',
      path: '/employee/reservations',
      icon: Calendar,
    },
    {
      name: 'Konumlar',
      path: '/employee/locations',
      icon: MapPin,
    },
    {
      name: 'Bildirimler',
      path: '/employee/notifications',
      icon: Bell,
    },
    {
      name: 'Raporlar',
      path: '/employee/reports',
      icon: BarChart3,
    },
    {
      name: 'Destek',
      path: '/employee/support',
      icon: BookOpen,
    },
    {
      name: 'Ayarlar',
      path: '/employee/settings',
      icon: Settings,
    },
  ];

  // Manager menu
  const managerMenu = [
    {
      name: 'Dashboard',
      path: '/manager/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Kullanıcılar',
      path: '/manager/users',
      icon: Users,
    },
    {
      name: 'Rezervasyonlar',
      path: '/manager/reservations',
      icon: Calendar,
    },
    {
      name: 'Raporlar',
      path: '/manager/reports',
      icon: BarChart3,
    },
    {
      name: 'Bildirimler',
      path: '/manager/notifications',
      icon: Bell,
    },
    {
      name: 'Loglar',
      path: '/manager/logs',
      icon: Activity,
    },
  ];

  // Admin menu
  const adminMenu = [
    {
      name: 'Genel Bakış',
      path: '/admin/overview',
      icon: LayoutDashboard,
    },
    {
      name: 'Konumlar',
      path: '/admin/locations',
      icon: Building,
    },
    {
      name: 'Kat Planı',
      path: '/admin/floorplan',
      icon: Shield,
    },
    {
      name: 'Kurallar',
      path: '/admin/rules',
      icon: BookOpen,
    },
    {
      name: 'Bildirimler',
      path: '/admin/notifications',
      icon: Bell,
    },
    {
      name: 'Onaylar',
      path: '/admin/approval',
      icon: CheckSquare,
    },
    {
      name: 'Loglar',
      path: '/admin/logs',
      icon: Activity,
    },
    {
      name: 'Yedekleme',
      path: '/admin/backup',
      icon: HardDrive,
    },
    {
      name: 'Kullanıcılar',
      path: '/admin/users',
      icon: Users,
    },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case UserRole.Manager:
        return managerMenu;
      case UserRole.Admin:
        return adminMenu;
      case UserRole.Employee:
      default:
        return employeeMenu;
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar-glass flex flex-col h-screen">
      <nav className="flex-1 overflow-y-auto">
        <ul style={{ marginTop: '1rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-menu-item${active ? ' sidebar-menu-item-active' : ''}`}
                >
                  <Icon className="sidebar-menu-icon w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-avatar">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div style={{ minWidth: '0', flex: 1 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '0.875rem',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>
            {user?.role === UserRole.Admin
              ? 'Yönetici'
              : user?.role === UserRole.Manager
                ? 'Yönetmen'
                : 'Çalışan'}
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        style={{ 
          padding: '0.75rem 1rem', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: '0.75rem', 
          background: 'rgba(239, 68, 68, 0.05)', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem', 
          color: '#ef4444', 
          fontSize: '0.85rem', 
          fontWeight: 600,
          marginTop: '0.75rem',
          width: '100%',
          transition: 'all 0.25s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ef4444';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.borderColor = 'transparent';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
          e.currentTarget.style.color = '#ef4444';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
        }}
      >
        <LogOut className="w-4 h-4" />
        <span>Çıkış Yap</span>
      </button>
    </aside>
  );
};

export default Sidebar;