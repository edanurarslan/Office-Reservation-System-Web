import React, { useState } from 'react';
import { PageContainer, PageHeader, StatCard, PrimaryButton } from '../../widgets';
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({ start: '2025-11-01', end: '2025-11-16' });

  const reportStats = {
    totalReservations: 450,
    avgOccupancy: 78,
    peakHours: '14:00-16:00',
    topLocation: 'A Bloğu - 1. Kat',
  };

  const monthlyData = [
    { month: 'Kas', reservations: 340, occupancy: 75 },
    { month: 'Eki', reservations: 280, occupancy: 68 },
    { month: 'Eyl', reservations: 350, occupancy: 80 },
    { month: 'Ağu', reservations: 290, occupancy: 70 },
  ];

  const handleDownload = (format: 'pdf' | 'csv') => {
    console.log(`Download report as ${format.toUpperCase()}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Raporlar"
        description="Sistem kullanım istatistikleri ve raporları görüntüleyin."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#312e81', display: 'block', marginBottom: '0.5rem' }}>Başlangıç Tarihi</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#312e81', display: 'block', marginBottom: '0.5rem' }}>Bitiş Tarihi</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <StatCard label="Toplam Rezervasyon" value={reportStats.totalReservations} icon={<Calendar style={{ width: '24px', height: '24px' }} />} color="blue" trend={{ value: 12, isPositive: true }} />
        <StatCard label="Ortalama Doluluk" value={`${reportStats.avgOccupancy}%`} icon={<TrendingUp style={{ width: '24px', height: '24px' }} />} color="green" trend={{ value: 5, isPositive: true }} />
        <StatCard label="En Yoğun Saat" value={reportStats.peakHours} icon={<BarChart3 style={{ width: '24px', height: '24px' }} />} color="orange" />
        <StatCard label="En Popüler Yer" value={reportStats.topLocation} icon={<TrendingUp style={{ width: '24px', height: '24px' }} />} color="purple" />
      </div>

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#312e81', marginBottom: '1.5rem' }}>Aylık Trendler</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', height: 250, justifyContent: 'center' }}>
          {monthlyData.map((data, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: 150, marginBottom: '0.5rem' }}>
                <div
                  style={{
                    background: 'linear-gradient(180deg, #6366f1, #818cf8)',
                    width: '20px',
                    height: `${(data.reservations / 400) * 100}px`,
                    borderRadius: '0.5rem 0.5rem 0 0',
                  }}
                  title={`Rezervasyon: ${data.reservations}`}
                />
                <div
                  style={{
                    background: 'linear-gradient(180deg, #10b981, #34d399)',
                    width: '20px',
                    height: `${(data.occupancy / 100) * 100}px`,
                    borderRadius: '0.5rem 0.5rem 0 0',
                  }}
                  title={`Doluluk: ${data.occupancy}%`}
                />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#312e81' }}>{data.month}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', justifyContent: 'center', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '0.25rem' }} />
            <span style={{ color: '#6b7280' }}>Rezervasyon Sayısı</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '0.25rem' }} />
            <span style={{ color: '#6b7280' }}>Doluluk Oranı</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <PrimaryButton onClick={() => handleDownload('pdf')} size="medium">
          <Download style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
          PDF Olarak İndir
        </PrimaryButton>
        <PrimaryButton onClick={() => handleDownload('csv')} size="medium" style={{ background: '#10b981', borderColor: '#10b981' }}>
          <Download style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
          CSV Olarak İndir
        </PrimaryButton>
      </div>
    </PageContainer>
  );
};

export default ReportsPage;
