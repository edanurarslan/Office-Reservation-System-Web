import React, { useState } from 'react';
import { PageContainer, PageHeader, Table, PrimaryButton } from '../../widgets';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  floor: number;
  totalDesks: number;
  availableDesks: number;
  type: 'desk' | 'room';
}

const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: 'A Bloğu - 1. Kat', floor: 1, totalDesks: 12, availableDesks: 5, type: 'desk' },
    { id: '2', name: 'B Bloğu - 2. Kat', floor: 2, totalDesks: 8, availableDesks: 2, type: 'room' },
    { id: '3', name: 'C Bloğu - Zemin Kat', floor: 0, totalDesks: 4, availableDesks: 1, type: 'desk' },
    { id: '4', name: 'D Bloğu - 1. Kat', floor: 1, totalDesks: 10, availableDesks: 7, type: 'desk' },
  ]);

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
      key: 'floor',
      label: 'Kat',
      sortable: true,
      render: (value: number) => <span style={{ fontWeight: 600, color: '#312e81' }}>Kat {value}</span>,
    },
    {
      key: 'type',
      label: 'Tür',
      sortable: true,
      render: (value: string) => (
        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: value === 'desk' ? '#eef2ff' : '#fef3c7', color: value === 'desk' ? '#312e81' : '#92400e', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {value === 'desk' ? 'Masa' : 'Oda'}
        </span>
      ),
    },
    {
      key: 'totalDesks',
      label: 'Toplam',
      sortable: true,
      render: (value: number) => <span style={{ fontWeight: 600, color: '#6366f1' }}>{value}</span>,
    },
    {
      key: 'availableDesks',
      label: 'Müsait',
      sortable: true,
      render: (value: number) => (
        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (value: any, row: Location) => (
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
        <Table
          columns={columns as any}
          data={locations}
          pagination={true}
          pageSize={10}
          striped={true}
        />
      </div>
    </PageContainer>
  );
};

export default LocationsPage;
