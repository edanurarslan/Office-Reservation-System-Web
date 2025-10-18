import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-600 mt-1">
          Hesap bilgilerinizi görüntüleyin ve düzenleyin
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ad</label>
            <p className="mt-1 text-sm text-gray-900">{user?.firstName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Soyad</label>
            <p className="mt-1 text-sm text-gray-900">{user?.lastName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">E-posta</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <p className="mt-1 text-sm text-gray-900">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;