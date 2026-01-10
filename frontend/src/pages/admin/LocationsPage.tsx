import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Table, PrimaryButton } from '../../widgets';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import apiService from '../../utils/services/api';
import type { Location } from '../../types';

const emptyLocation = { id: '', name: '', address: '', isActive: true, floors: [] };

const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [current, setCurrent] = useState<Location>(emptyLocation);
  const [saving, setSaving] = useState(false);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLocations();
      setLocations(data);
      setError(null);
    } catch (err) {
      setError('Lokasyonlar yüklenirken bir hata oluştu');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenModal = (loc?: Location) => {
    if (loc) {
      setEditMode(true);
      setCurrent(loc);
    } else {
      setEditMode(false);
      setCurrent(emptyLocation);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrent(emptyLocation);
    setEditMode(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editMode) {
        await apiService.updateLocation(current.id, {
          name: current.name,
          address: current.address,
          isActive: current.isActive
        });
      } else {
        await apiService.createLocation({
          name: current.name,
          address: current.address
        });
      }
      await fetchLocations();
      handleCloseModal();
    } catch (e) {
      setError('Lokasyon kaydedilemedi');
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu lokasyonu silmek istediğinize emin misiniz?')) return;
    try {
  await apiService.deleteLocation(id);
      await fetchLocations();
    } catch (e) {
      setError('Lokasyon silinemedi');
    }
  };

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
          <button style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleOpenModal(row)}>
            <Edit2 style={{ width: '16px', height: '16px' }} />
            Düzenle
          </button>
          <button style={{ padding: '0.5rem 0.75rem', border: '1px solid #fee2e2', borderRadius: '0.5rem', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleDelete(row.id)}>
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
        description="Tüm ofis lokasyonlarını yönetin"
        icon={<MapPin style={{ width: '28px', height: '28px', color: 'white' }} />}
      />

      <div style={{ marginBottom: '2rem' }}>
        <PrimaryButton onClick={() => handleOpenModal()} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', fontWeight: 600 }}>
          <Plus style={{ width: '16px', height: '16px' }} />
          Yeni Konum
        </PrimaryButton>
      </div>

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', overflowX: 'auto' }}>
        {/* Modal */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', minWidth: 350, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>{editMode ? 'Lokasyon Düzenle' : 'Yeni Lokasyon Ekle'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  type="text"
                  placeholder="Lokasyon Adı"
                  value={current.name}
                  onChange={e => setCurrent({ ...current, name: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 15 }}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Adres"
                  value={current.address}
                  onChange={e => setCurrent({ ...current, address: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 15 }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={current.isActive}
                    onChange={e => setCurrent({ ...current, isActive: e.target.checked })}
                  /> Aktif
                </label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={handleSave} disabled={saving || !current.name || !current.address} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: 15, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
                  <button onClick={handleCloseModal} style={{ background: '#e5e7eb', color: '#312e81', border: 'none', borderRadius: 6, padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>İptal</button>
                </div>
              </div>
            </div>
          </div>
        )}
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
