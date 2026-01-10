
import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton, Modal, Table } from '../../widgets';
import { CheckCircle, XCircle, Clock, Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import api from '../../utils/services/api';
import type { Reservation as BackendReservation } from '../../types';

// Table display type
interface TableReservation {
  id: string;
  desk: string;
  date: string;
  time: string;
  status: string;
  location?: string;
}

const EmployeeReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<TableReservation | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    resourceType: 'Desk',
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyReservations();
      
      // Kendi rezervasyonlarını göster
      const mapped: TableReservation[] = data.map((r) => ({
        id: r.id,
        desk: r.resourceType === 'Desk' ? (r.deskName || r.desk?.name || '-') : (r.roomName || r.room?.name || '-'),
        date: r.startsAt ? r.startsAt.split('T')[0] : '-',
        time: r.startsAt && r.endsAt ? `${r.startsAt.split('T')[1]?.slice(0,5)}-${r.endsAt.split('T')[1]?.slice(0,5)}` : '-',
        status: r.status || 'Pending',
      }));
      setReservations(mapped);
    } catch (e) {
      console.error('Rezervasyonlar yüklenemedi:', e);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async () => {
    if (!formData.resourceId || !formData.date || !formData.startTime || !formData.endTime) {
      console.error('Tüm alanları doldurunuz');
      return;
    }

    setFormLoading(true);
    try {
      await api.createReservation({
        resourceType: formData.resourceType,
        resourceId: formData.resourceId,
        startsAt: `${formData.date}T${formData.startTime}:00`,
        endsAt: `${formData.date}T${formData.endTime}:00`,
      });
      console.log('✅ Rezervasyon başarıyla oluşturuldu');
      setIsCreateModalOpen(false);
      setFormData({ resourceType: 'Desk', resourceId: '', date: '', startTime: '', endTime: '' });
      fetchReservations();
    } catch (error: any) {
      console.error('❌ Rezervasyon oluşturulamadı:', error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    setFormLoading(true);
    try {
      await api.cancelReservation(id);
      console.log('✅ Rezervasyon iptal edildi');
      fetchReservations();
    } catch (error: any) {
      console.error('❌ İptal işlemi başarısız:', error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const statusConfig: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    Pending: { bg: '#fef3c7', color: '#92400e', icon: <Clock style={{ width: '16px', height: '16px' }} />, label: 'Beklemede' },
    Approved: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle style={{ width: '16px', height: '16px' }} />, label: 'Onaylandı' },
    Rejected: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle style={{ width: '16px', height: '16px' }} />, label: 'Reddedildi' },
  };

  const approvedCount = reservations.filter(r => r.status === 'Approved').length;
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
      key: 'date',
      header: 'Tarih',
      render: (value: string) => (
        <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar style={{ width: '16px', height: '16px' }} /> {value}
        </div>
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
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: statusConfig[value].bg,
          color: statusConfig[value].color,
          padding: '0.4rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {statusConfig[value].icon}
          {statusConfig[value].label}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_value: string, row: TableReservation) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleCancelReservation(row.id)}
            style={{
              padding: '0.5rem 0.75rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#991b1b',
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            İptal Et
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Rezervasyonlarım"
        description="Kişisel masa/oda rezervasyonlarınızı yönetin."
        icon={<Calendar />}
      />

      <PrimaryButton 
        onClick={() => setIsCreateModalOpen(true)}
        style={{ alignItems: 'center', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', marginBottom: '1.5rem' }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Yeni Rezervasyon
      </PrimaryButton>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#dcfce7', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#10b981', width: '48px', height: '48px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle style={{ width: '28px', height: '28px', color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 500 }}>Onaylı Rezervasyon</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#166534' }}>{approvedCount}</div>
          </div>
        </div>

        <div style={{ background: '#fef3c7', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #fde047', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#f59e0b', width: '48px', height: '48px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock style={{ width: '28px', height: '28px', color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: 500 }}>Beklemede Rezervasyon</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#92400e' }}>{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* Tablo */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Yükleniyor...</div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Henüz rezervasyonunuz yok</div>
        ) : (
          <Table
            columns={columns as any}
            data={reservations}
            pagination={true}
            pageSize={10}
            striped={true}
          />
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Yeni Rezervasyon Oluştur" size="large">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#312e81' }}>Tür</label>
            <select
              value={formData.resourceType}
              onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
            >
              <option value="Desk">Masa</option>
              <option value="Room">Oda</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#312e81' }}>Masa/Oda ID</label>
            <input
              type="text"
              placeholder="ID girin"
              value={formData.resourceId}
              onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#312e81' }}>Tarih</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#312e81' }}>Başlama Saati</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#312e81' }}>Bitiş Saati</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <SecondaryButton onClick={() => setIsCreateModalOpen(false)} style={{ alignItems: 'center', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', marginBottom: '1.5rem' }}>İptal</SecondaryButton>
          <PrimaryButton onClick={handleCreateReservation} disabled={formLoading} style={{ alignItems: 'center', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {formLoading ? 'Oluşturuluyor...' : 'Rezervasyon Oluştur'}
          </PrimaryButton>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default EmployeeReservationsPage;
