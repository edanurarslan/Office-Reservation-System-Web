import React from 'react';
import { Users } from 'lucide-react';
import '../../styles/page-custom.css';

const UsersPage: React.FC = () => {
  return (
    <div className="page-center">
      <div className="page-glass" style={{width: '100%', maxWidth: 600}}>
        <div className="page-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">Kullanıcı Yönetimi</h1>
              <p className="mt-1 text-gray-600">
                Ekip üyelerini görüntüleyin, rollerini yönetin ve yeni üye ekleyin.
              </p>
            </div>
            <div className="hidden rounded-full bg-primary-50 p-3 text-primary-600 md:flex">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="page-info">
          Kullanıcı listesi ve davet akışı üzerinde çalışıyoruz. Yakında buradan kullanıcı
          yönetimini tamamlayabileceksiniz.
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
