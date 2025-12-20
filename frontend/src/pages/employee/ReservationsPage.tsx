import React, { useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PageContainer, PageHeader, Table, TextInput, SecondaryButton } from '../../widgets';
import { MapPin, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import apiService from '../../utils/services/api';
import type { Reservation as ReservationType } from '../../types';

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getMyReservations();
        if (isMounted) setReservations(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Rezervasyonlar yükelenirken hata oluştu');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReservations();
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) return;

    try {
      setDeletingId(id);
      await apiService.cancelReservation(id);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    return reservations.filter(r => {
      const matchesStatus = statusFilter === 'all' || (r.status?.toLowerCase() ?? '').includes(statusFilter.toLowerCase());
      const deskName = r.desk?.name ?? '';
      const roomName = r.room?.name ?? '';
      const searchable = (deskName + roomName).toLowerCase();
      const matchesSearch = searchable.includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchTerm, reservations]);

  const statusConfig: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    confirmed: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle style={{ width: '16px', height: '16px' }} />, label: 'Onaylı' },
    pending: { bg: '#fef3c7', color: '#92400e', icon: <Clock style={{ width: '16px', height: '16px' }} />, label: 'Beklemede' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', icon: <AlertCircle style={{ width: '16px', height: '16px' }} />, label: 'İptal' },
    checkedin: { bg: '#dbeafe', color: '#0c4a6e', icon: <CheckCircle style={{ width: '16px', height: '16px' }} />, label: 'Giriş Yapıldı' },
    checkedout: { bg: '#d1d5db', color: '#374151', icon: <CheckCircle style={{ width: '16px', height: '16px' }} />, label: 'Tamamlandı' },
    noshow: { bg: '#fee2e2', color: '#991b1b', icon: <AlertCircle style={{ width: '16px', height: '16px' }} />, label: 'Gelmedi' },
  };

  const getStatusLabel = (status: string) => {
    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    return config;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'd MMM HH:mm', { locale: tr });
    } catch {
      return dateString;
    }
  };

  const columns = [
    {
      key: 'resource',
      header: 'Masa/Oda',
      render: (_: unknown, row: ReservationType) => {
        const name = row.desk?.name || row.room?.name || '-';
        return <div style={{ fontWeight: 600, color: '#312e81' }}>{name}</div>;
      },
    },
    {
      key: 'startsAt',
      header: 'Başlangıç',
      render: (value: string) => <div style={{ color: '#6b7280' }}>{formatDateTime(value)}</div>,
    },
    {
      key: 'endsAt',
      header: 'Bitiş',
      render: (value: string) => <div style={{ color: '#6b7280' }}>{formatDateTime(value)}</div>,
    },
    {
      key: 'status',
      header: 'Durum',
      render: (value: string) => {
        const config = getStatusLabel(value);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: config.bg, color: config.color, padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600, width: 'fit-content' }}>
            {config.icon}
            {config.label}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'İşlem',
      render: (_: unknown, row: ReservationType) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleDelete(row.id)}
            disabled={deletingId === row.id || (row.status && ['Cancelled', 'CheckedOut', 'NoShow'].includes(row.status))}
            style={{
              padding: '0.5rem 0.75rem',
              background: deletingId === row.id ? '#d1d5db' : '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              cursor: deletingId === row.id ? 'wait' : 'pointer',
              color: '#991b1b',
              fontSize: '0.8rem',
              fontWeight: 600,
              opacity: (row.status && ['Cancelled', 'CheckedOut', 'NoShow'].includes(row.status)) ? 0.5 : 1,
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
          <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '1rem' }}>⚙️</div>
          <div>Yükleniyor...</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div style={{ background: '#fee2e2', borderRadius: '1rem', padding: '2rem', color: '#991b1b' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>❌ Hata oluştu</div>
          <div>{error}</div>
          <SecondaryButton onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Sayfayı Yenile
          </SecondaryButton>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Rezervasyonlarım"
        description={`Toplam ${reservations.length} rezervasyonunuz var`}
      />

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <TextInput
            label="Ara"
            placeholder="Masa veya oda adı ara..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#312e81', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Durum
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                color: '#312e81',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <option value="all">Tümü ({reservations.length})</option>
              <option value="confirmed">Onaylı ({reservations.filter(r => r.status === 'Confirmed').length})</option>
              <option value="pending">Beklemede ({reservations.filter(r => r.status === 'Pending').length})</option>
              <option value="cancelled">İptal ({reservations.filter(r => r.status === 'Cancelled').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
            <MapPin style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Rezervasyon bulunamadı</p>
          </div>
        ) : (
          <Table
            columns={columns as any}
            data={filtered}
            pagination={true}
            pageSize={10}
            striped={true}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default ReservationsPage;
