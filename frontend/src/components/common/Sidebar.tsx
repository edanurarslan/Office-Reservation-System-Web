import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Building, 
  QrCode, 
  BarChart3 
} from 'lucide-react';
import { UserRole } from '../../types';

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
    <aside className="w-64 bg-white shadow-lg min-h-screen border-r border-gray-200">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${
                    active ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className={active ? 'text-primary-700 font-semibold' : 'text-gray-700'}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Sidebar Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-600">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;