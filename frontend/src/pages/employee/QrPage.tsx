import React from 'react';
import { QrCode } from 'lucide-react';

const QrPage: React.FC = () => {
  return (
    <div className="page-center">
      <div className="page-glass" style={{width: '100%', maxWidth: 600}}>
        <div className="page-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">QR Kod İşlemleri</h1>
              <p className="mt-1 text-gray-600">
                Rezervasyonlarınız için QR kod üretin, indirin veya tarama geçmişini görüntüleyin.
              </p>
            </div>
            <div className="hidden rounded-full bg-primary-50 p-3 text-primary-600 md:flex">
              <QrCode className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="page-info">
          Bu alan çok yakında QR kod üretme ve tarama işlemleriyle ilgili akışları içerecek. Şimdilik
          rezervasyonlar sayfasından devam edebilirsiniz.
        </div>
      </div>
    </div>
  );
};

export default QrPage;
