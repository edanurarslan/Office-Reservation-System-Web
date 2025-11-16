import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2 } from 'lucide-react';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        // Kullanıcı rolüne göre dashboard'a yönlendir
        switch (user.role) {
          case 'Admin':
            navigate('/admin/overview');
            break;
          case 'Manager':
            navigate('/manager/dashboard');
            break;
          case 'Employee':
          default:
            navigate('/employee/dashboard');
        }
      } else {
        navigate('/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700">
      <div className="text-center">
        <div className="mb-8 inline-flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-xl animate-pulse"></div>
            <Building2 className="w-24 h-24 text-white relative" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">Ofis Yönetim</h1>
        <p className="text-indigo-100 text-lg">Sistemi</p>

        <div className="mt-12">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-white text-sm mt-4">Yükleniyor...</p>
        </div>
      </div>
    </div>
  );
};
