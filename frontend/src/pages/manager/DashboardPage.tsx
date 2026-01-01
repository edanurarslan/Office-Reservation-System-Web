import React, { useEffect, useState } from 'react';
import { PageContainer, PageHeader, PrimaryButton } from '../../widgets';
import { CalendarCheck, Clock, Plus, LayoutDashboard } from 'lucide-react';
import api from '../../utils/services/api';
import type { DashboardPage } from '../employee';

const ManagerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    todayReservations: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboardStats();
        setStats({
          todayReservations: res?.todayReservations || 0,
          pendingApprovals: res?.pendingApprovals || 0
        });
      } catch {
        setStats({ todayReservations: 0, pendingApprovals: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Yönetici Paneli"
        description="Rezervasyonlar, raporlar ve onay bekleyen işlemler."
        action={
          <div style={{ marginTop: '1.5rem', marginRight: '1.5rem' }}>
            <PrimaryButton 
              onClick={() => {}} 
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Rezervasyon
            </PrimaryButton>
          </div>
        }
      />

      <div className="flex flex-col gap-8 mt-6">
        {/* Beklemede Olanlar Bildirimi (Rezervasyon sayfasındaki sarı banner yapısı) */}
        {stats.pendingApprovals > 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, #fef3c7, #fcd34d)', 
            borderRadius: '1rem', 
            padding: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            boxShadow: '0 4px 15px rgba(251, 191, 36, 0.2)'
          }}>
            <div style={{ 
              background: '#fbbf24', 
              width: '48px', 
              height: '48px', 
              borderRadius: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0 
            }}>
              <Clock style={{ width: '28px', height: '28px', color: '#92400e' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '1.1rem' }}>
                {stats.pendingApprovals} Onay Bekleyen İşlem
              </div>
              <div style={{ color: '#b45309', fontSize: '0.9rem' }}>
                İncelemeniz gereken bekleyen rezervasyon talepleri mevcut.
              </div>
            </div>
          </div>
        )}

        {/* Ana İçerik Kartı (Rezervasyon sayfasındaki beyaz kart yapısı) */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '1.5rem', 
          padding: '2.5rem', 
          boxShadow: '0 8px 32px rgba(31,38,135,0.07)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          
          {/* İstatistikler */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div style={{ 
              padding: '1.5rem', 
              borderRadius: '1.25rem', 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: '1rem' }}>
                <CalendarCheck style={{ color: '#4338ca', width: '24px', height: '24px' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, margin: 0 }}>Bugünkü Rezervasyonlar</p>
                <p style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: 700, margin: 0 }}>{stats.todayReservations}</p>
              </div>
            </div>

            <div style={{ 
              padding: '1.5rem', 
              borderRadius: '1.25rem', 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '1rem' }}>
                <Clock style={{ color: '#d97706', width: '24px', height: '24px' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, margin: 0 }}>Bekleyen Onaylar</p>
                <p style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: 700, margin: 0 }}>{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          {/* Bilgi Alanı */}
          <div style={{ 
            borderRadius: '1.25rem', 
            padding: '3rem 2rem', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
            border: '2px dashed #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
               <LayoutDashboard style={{ width: '32px', height: '32px', color: '#6366f1' }} />
            </div>
            <div style={{ maxWidth: '400px' }}>
              <p style={{ color: '#312e81', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {loading ? 'Veriler Hazırlanıyor...' : 'Operasyonel Genel Bakış'}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Sistem üzerindeki tüm rezervasyon trafiğini, doluluk oranlarını ve ekip bazlı raporları buradan takip edebilirsiniz.
              </p>
            </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}

export default ManagerDashboardPage;