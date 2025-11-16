import React, { useState } from 'react';
import { PageContainer, PageHeader, Table } from '../../widgets';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Reservation {
  id: string;
  desk: string;
  employee: string;
  date: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const ManagerReservationsPage: React.FC = () => {
  const [reservations] = useState<Reservation[]>([
    { id: '1', desk: 'A101', employee: 'Ahmet Yılmaz', date: '2024-01-16', time: '09:00-10:00', status: 'Pending' },
    { id: '2', desk: 'B202', employee: 'Fatma Kaya', date: '2024-01-16', time: '14:00-15:00', status: 'Pending' },
    { id: '3', desk: 'A105', employee: 'Can Demirel', date: '2024-01-17', time: '10:00-11:00', status: 'Approved' },
  ]);

  const statusConfig: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    Pending: { bg: '#fef3c7', color: '#92400e', icon: <Clock style={{ width: '16px', height: '16px' }} />, label: 'Beklemede' },
    Approved: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle style={{ width: '16px', height: '16px' }} />, label: 'Onaylandı' },
    Rejected: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle style={{ width: '16px', height: '16px' }} />, label: 'Reddedildi' },
  };

  const pendingCount = reservations.filter(r => r.status === 'Pending').length;

  const columns = [
    {
      key: 'desk',
      header: 'Masa/Oda',
      render: (value: string) => (
        <div style={{ fontWeight: 600, color: '#312e81' }}>{value}</div>
      ),
    },
    {
      key: 'employee',
      header: 'Çalışan',
      render: (value: string) => (
        <div style={{ color: '#6b7280' }}>{value}</div>
      ),
    },
    {
      key: 'date',
      header: 'Tarih',
      render: (value: string) => (
        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{value}</div>
      ),
    },
    {
      key: 'time',
      header: 'Saat',
      render: (value: string) => (
        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{value}</div>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      render: (value: string) => (
        <div style={{ 
          display: 'inline-block',
          background: statusConfig[value].bg,
          color: statusConfig[value].color,
          padding: '0.25rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {statusConfig[value].label}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            style={{
              padding: '0.5rem 0.75rem',
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#166534',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            <CheckCircle style={{ width: '14px', height: '14px' }} />
          </button>
          <button
            style={{
              padding: '0.5rem 0.75rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#991b1b',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            <XCircle style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Rezervasyon Onayları"
        description="Çalışanların rezervasyon isteklerini yönetin."
      />

      {pendingCount > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fcd34d)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fbbf24', width: '48px', height: '48px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock style={{ width: '32px', height: '32px', color: '#92400e' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '1.1rem' }}>{pendingCount} Beklemede Rezervasyon</div>
            <div style={{ color: '#b45309', fontSize: '0.9rem' }}>Lütfen beklemede olan rezervasyonları gözden geçirin</div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', overflowX: 'auto' }}>
        <Table
          columns={columns as any}
          data={reservations}
          pagination={true}
          pageSize={10}
          striped={true}
        />
      </div>
    </PageContainer>
  );
};

export default ManagerReservationsPage;
