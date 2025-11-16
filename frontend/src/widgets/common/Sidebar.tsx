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
      name: 'QR Kod',
      path: '/employee/qr',
      icon: QrCode,
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
        <div style={{ minWidth: '0' }}>
          <div style={{ fontWeight: 600, color: '#6366f1', fontSize: '0.9rem' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>
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
        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition rounded-lg border-t border-indigo-100 text-sm font-medium"
      >
        <LogOut className="w-4 h-4" />
        <span>Çıkış Yap</span>
      </button>
    </aside>
  );
};

export default Sidebar;