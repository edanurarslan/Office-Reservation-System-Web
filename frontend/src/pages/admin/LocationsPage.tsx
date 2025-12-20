import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Table, PrimaryButton } from '../../widgets';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import apiService from '../../utils/services/api';
import type { Location } from '../../types';

const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await apiService.getLocations();
        setLocations(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Lokasyonlar yüklenirken bir hata oluştu');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Lokasyon Adı',
      sortable: true,
      render: (value: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin style={{ width: '18px', height: '18px', color: '#6366f1' }} />
          <span style={{ fontWeight: 600, color: '#312e81' }}>{value}</span>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Adres',
      sortable: true,
      render: (value: string) => <span style={{ color: '#666', fontSize: '0.9rem' }}>{value}</span>,
    },
    {
      key: 'isActive',
      label: 'Durum',
      sortable: true,
      render: (value: boolean) => (
        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: value ? '#dcfce7' : '#fee2e2', color: value ? '#166534' : '#991b1b', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {value ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (_: any, row: Location) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => console.log('Edit', row.id)}>
            <Edit2 style={{ width: '16px', height: '16px' }} />
            Düzenle
          </button>
          <button style={{ padding: '0.5rem 0.75rem', border: '1px solid #fee2e2', borderRadius: '0.5rem', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setLocations(prev => prev.filter(l => l.id !== row.id))}>
            <Trash2 style={{ width: '16px', height: '16px' }} />
            Sil
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Lokasyonlar"
        description="Tüm ofis lokasyonlarını yönetin."
      />

      <div style={{ marginBottom: '2rem' }}>
        <PrimaryButton onClick={() => console.log('Yeni lokasyon')} size="medium">
          <Plus style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
          Yeni Lokasyon
        </PrimaryButton>
      </div>

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', overflowX: 'auto' }}>
        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Lokasyonlar yükleniyor...
          </div>
        ) : locations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            Lokasyon bulunamadı
          </div>
        ) : (
          <Table
            columns={columns as any}
            data={locations}
            pagination={true}
            pageSize={10}
            striped={true}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default LocationsPage;
