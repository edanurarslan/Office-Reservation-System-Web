import React from 'react';
import { BarChart3 } from 'lucide-react';
import '../../styles/page-custom.css';

const ReportsPage: React.FC = () => {
  return (
    <div className="page-center">
      <div className="page-glass" style={{width: '100%', maxWidth: 600}}>
        <div className="page-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">Raporlar</h1>
              <p className="mt-1 text-gray-600">
                Rezervasyon eğilimleri, doluluk oranı ve ekip katılımını görselleştirin.
              </p>
            </div>
            <div className="hidden rounded-full bg-primary-50 p-3 text-primary-600 md:flex">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="page-info">
          Analitik panelleri üzerinde çalışıyoruz. Yakında bu ekrandan doluluk ve rezervasyon
          metriklerini takip edebileceksiniz.
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
