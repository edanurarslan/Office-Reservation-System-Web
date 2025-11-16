import React, { useState, useMemo } from 'react';
import { PageContainer, PageHeader, Table, TextInput } from '../../widgets';
import { MapPin, Trash2, Star } from 'lucide-react';

interface Reservation {
  id: string;
  desk: string;
  start: string;
  end: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checkedout';
  location: string;
}

interface Favorite {
  id: string;
  name: string;
  type: 'desk' | 'room';
  location: string;
  capacity: number;
  isFavorite: boolean;
}

const ReservationsPage: React.FC = () => {
  const [reservations] = useState<Reservation[]>([
    { id: '1', desk: 'A101', start: '2024-01-16', end: '09:00-10:00', status: 'confirmed', location: 'Floor 1' },
    { id: '2', desk: 'B202', start: '2024-01-17', end: '14:00-15:00', status: 'pending', location: 'Floor 2' },
    { id: '3', desk: 'A105', start: '2024-01-18', end: '10:00-11:00', status: 'confirmed', location: 'Floor 1' },
  ]);

  const [favorites] = useState<Favorite[]>([
    { id: '1', name: 'A101 Masa', type: 'desk', location: 'Floor 1', capacity: 1, isFavorite: true },
    { id: '2', name: 'Toplantı Odası 1', type: 'room', location: 'Floor 2', capacity: 8, isFavorite: true },
  ]);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return reservations.filter(r => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSearch = r.desk.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchTerm]);

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Bekleme' },
    confirmed: { bg: '#dcfce7', color: '#166534', label: 'Onaylı' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'İptal' },
    checkedout: { bg: '#dbeafe', color: '#0c4a6e', label: 'Tamamlandı' },
  };

  const columns = [
    {
      key: 'desk',
      header: 'Masa/Oda',
      render: (value: string) => (
        <div style={{ fontWeight: 600, color: '#312e81' }}>{value}</div>
      ),
    },
    {
      key: 'location',
      header: 'Konum',
      render: (value: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
          <MapPin style={{ width: '16px', height: '16px' }} />
          {value}
        </div>
      ),
    },
    {
      key: 'start',
      header: 'Tarih',
      render: (value: string) => (
        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{value}</div>
      ),
    },
    {
      key: 'end',
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
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#312e81',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Star style={{ width: '14px', height: '14px' }} />
          </button>
          <button
            style={{
              padding: '0.5rem 0.75rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#991b1b',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Rezervasyonlarım"
        description="Masa ve toplantı odası rezervasyonlarınızı yönetin."
      />

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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
              <option value="all">Tümü</option>
              <option value="pending">Bekleme</option>
              <option value="confirmed">Onaylı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem', overflowX: 'auto' }}>
        <Table
          columns={columns as any}
          data={filtered}
          pagination={true}
          pageSize={10}
          striped={true}
        />
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#312e81', marginBottom: '1.5rem' }}>Favori Masalar/Odalar ({favorites.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {favorites.map(fav => (
              <div
                key={fav.id}
                style={{
                  background: `linear-gradient(135deg, #eef2ff, #f3e8ff)`,
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid #c7d2fe',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#312e81', marginBottom: '0.5rem' }}>{fav.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin style={{ width: '14px', height: '14px' }} />
                    {fav.location} • Kapasite: {fav.capacity}
                  </div>
                </div>
                <button
                  style={{
                    background: '#fbbf24',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <Star style={{ width: '18px', height: '18px', color: '#fff' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ReservationsPage;
