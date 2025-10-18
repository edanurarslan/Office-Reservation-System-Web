import React from 'react';

const ReservationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Rezervasyonlar</h1>
        <p className="text-gray-600 mt-1">
          Rezervasyonlarınızı yönetin ve yeni rezervasyon oluşturun
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500">
          Rezervasyon yönetimi yakında eklenecek...
        </p>
      </div>
    </div>
  );
};

export default ReservationsPage;