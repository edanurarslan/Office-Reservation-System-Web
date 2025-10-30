import React from 'react';
import { Building } from 'lucide-react';
import '../../styles/page-custom.css';

const LocationsPage: React.FC = () => {
  return (
    <div className="page-center">
      <div className="page-glass" style={{width: '100%', maxWidth: 600}}>
        <div className="page-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">Lokasyonlar</h1>
              <p className="mt-1 text-gray-600">
                Ofis lokasyonlarını, kat planlarını ve kapasiteleri buradan yönetin.
              </p>
            </div>
            <div className="hidden rounded-full bg-primary-50 p-3 text-primary-600 md:flex">
              <Building className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="page-info">
          Lokasyon yönetimi modülü hazırlık aşamasında. Kısa süre içinde lokasyon ve kat detaylarını
          bu ekrandan düzenleyebileceksiniz.
        </div>
      </div>
    </div>
  );
};

export default LocationsPage;
