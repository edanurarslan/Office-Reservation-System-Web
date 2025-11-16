import React, { useState } from 'react';
import { PageContainer, PageHeader, Table, SecondaryButton } from '../../widgets';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface Approval {
  id: string;
  userName: string;
  type: 'Reservation' | 'UserSignup' | 'LocationChange';
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const ApprovalPage: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([
    { id: '1', userName: 'Ahmet Yıldız', type: 'Reservation', requestDate: '2025-11-16', status: 'Pending' },
    { id: '2', userName: 'Elif Kaya', type: 'UserSignup', requestDate: '2025-11-15', status: 'Approved' },
    { id: '3', userName: 'Mehmet Demir', type: 'LocationChange', requestDate: '2025-11-14', status: 'Pending' },
    { id: '4', userName: 'Ayşe Çelik', type: 'Reservation', requestDate: '2025-11-13', status: 'Rejected' },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
      Pending: { bg: '#fef3c7', color: '#92400e', icon: <Clock style={{ width: '16px', height: '16px' }} />, label: 'Beklemede' },
      Approved: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle style={{ width: '16px', height: '16px' }} />, label: 'Onaylandı' },
      Rejected: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle style={{ width: '16px', height: '16px' }} />, label: 'Reddedildi' },
    };
    const config = statusConfig[status] || statusConfig.Pending;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', backgroundColor: config.bg, color: config.color, fontSize: '0.85rem', fontWeight: 600 }}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeMap = { Reservation: 'Rezervasyon', UserSignup: 'Kullanıcı Kaydı', LocationChange: 'Lokasyon Değişikliği' };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const columns = [
    {
      key: 'userName',
      label: 'Kullanıcı',
      sortable: true,
      render: (value: string) => <span style={{ fontWeight: 600, color: '#312e81' }}>{value}</span>,
    },
    {
      key: 'type',
      label: 'İstek Türü',
      sortable: true,
      render: (value: string) => (
        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#eef2ff', color: '#312e81', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {getTypeLabel(value)}
        </span>
      ),
    },
    {
      key: 'requestDate',
      label: 'İstek Tarihi',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('tr-TR'),
    },
    {
      key: 'status',
      label: 'Durum',
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (value: any, row: Approval) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {row.status === 'Pending' && (
            <>
              <button style={{ padding: '0.5rem 0.75rem', border: '1px solid #dcfce7', borderRadius: '0.5rem', background: '#dcfce7', cursor: 'pointer', color: '#166534', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setApprovals(prev => prev.map(a => a.id === row.id ? { ...a, status: 'Approved' } : a))}>
                Onayla
              </button>
              <button style={{ padding: '0.5rem 0.75rem', border: '1px solid #fee2e2', borderRadius: '0.5rem', background: '#fef2f2', cursor: 'pointer', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setApprovals(prev => prev.map(a => a.id === row.id ? { ...a, status: 'Rejected' } : a))}>
                Reddet
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = approvals.filter(a => a.status === 'Pending').length;

  return (
    <PageContainer>
      <PageHeader
        title="Onay Gerektiren İşlemler"
        description="Beklemede olan onayları yönetin."
      />

      {pendingCount > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fed7aa)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Clock style={{ width: '32px', height: '32px', color: '#92400e' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '1.1rem' }}>{pendingCount} Beklemede İstek</div>
            <div style={{ color: '#b45309', fontSize: '0.9rem' }}>Lütfen beklemede olan istekleri gözden geçirin ve onaylayın/reddedin</div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', overflowX: 'auto' }}>
        <Table
          columns={columns as any}
          data={approvals}
          pagination={true}
          pageSize={10}
          striped={true}
        />
      </div>
    </PageContainer>
  );
};

export default ApprovalPage;
