import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, Users, Building, QrCode, BarChart3 } from 'lucide-react';
import { UserRole } from '../../types';
import '../../styles/sidebar-navbar-custom.css';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: [UserRole.Employee, UserRole.Manager, UserRole.Admin]
    },
    {
      name: 'Rezervasyonlar',
      path: '/reservations',
      icon: Calendar,
      roles: [UserRole.Employee, UserRole.Manager, UserRole.Admin]
    },
    {
      name: 'QR Kod',
      path: '/qr',
      icon: QrCode,
      roles: [UserRole.Employee, UserRole.Manager, UserRole.Admin]
    },
    {
      name: 'Kullanıcılar',
      path: '/users',
      icon: Users,
      roles: [UserRole.Manager, UserRole.Admin]
    },
    {
      name: 'Lokasyonlar',
      path: '/locations',
      icon: Building,
      roles: [UserRole.Admin]
    },
    {
      name: 'Raporlar',
      path: '/reports',
      icon: BarChart3,
      roles: [UserRole.Manager, UserRole.Admin]
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="sidebar-glass">
      <nav>
        <ul style={{marginTop:'1rem'}}>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-menu-item${active ? ' sidebar-menu-item-active' : ''}`}
                >
                  <Icon className="sidebar-menu-icon" />
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
        <div style={{minWidth:'0'}}>
          <div style={{fontWeight:600,color:'#6366f1'}}>{user?.firstName} {user?.lastName}</div>
          <div style={{fontSize:'0.85rem',color:'#818cf8'}}>{user?.role}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;