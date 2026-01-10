import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Table, PrimaryButton } from '../../widgets';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';
import apiService from '../../utils/services/api';
import type { Rule, CreateRuleRequest } from '../../types';

const emptyRule: CreateRuleRequest = {
  name: '',
  description: '',
  ruleType: 'NoShow',
  scope: 'Global',
  configuration: {},
  priority: 1,
};

const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [current, setCurrent] = useState<CreateRuleRequest & { id?: string }>({ ...emptyRule });
  const [saving, setSaving] = useState(false);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRules();
      setRules(data);
      setError(null);
    } catch (err) {
      setError('Kurallar yüklenirken bir hata oluştu');
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenModal = (rule?: Rule) => {
    if (rule) {
      setEditMode(true);
      setCurrent({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        ruleType: rule.ruleType,
        scope: rule.scope,
        configuration: rule.configuration,
        priority: rule.priority,
        validFrom: rule.validFrom,
        validUntil: rule.validUntil,
        targetId: rule.targetId,
      });
    } else {
      setEditMode(false);
      setCurrent({ ...emptyRule });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrent({ ...emptyRule });
    setEditMode(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editMode && current.id) {
        await apiService.updateRule(current.id, current);
      } else {
        await apiService.createRule(current);
      }
      await fetchRules();
      handleCloseModal();
    } catch (e) {
      setError('Kural kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kuralı silmek istediğinize emin misiniz?')) return;
    try {
      await apiService.deleteRule(id);
      await fetchRules();
    } catch (e) {
      setError('Kural silinemedi');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Kural Adı',
      sortable: true,
      render: (value: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield style={{ width: '18px', height: '18px', color: '#6366f1' }} />
          <span style={{ fontWeight: 600, color: '#312e81' }}>{value}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Açıklama',
      sortable: true,
      render: (value: string) => <span style={{ color: '#666', fontSize: '0.9rem' }}>{value || '-'}</span>,
    },
    {
      key: 'ruleType',
      label: 'Tür',
      sortable: true,
      render: (value: string) => (
        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#eef2ff', color: '#312e81', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {value}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Öncelik',
      sortable: true,
      render: (value: number) => <span style={{ fontWeight: 600, color: '#6366f1' }}>{value}</span>,
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
      render: (_: any, row: Rule) => (
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
        title="Kurallar"
        description="Sistem kurallarını yönetin."
        icon={<Shield />}
      />

      <div style={{ marginBottom: '2rem' }}>
        <PrimaryButton onClick={() => handleOpenModal()} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', fontWeight: 600 }}>
          <Plus style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
          Yeni Kural
        </PrimaryButton>
      </div>

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', overflowX: 'auto' }}>
        {/* Modal */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', minWidth: 350, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>{editMode ? 'Kuralı Düzenle' : 'Yeni Kural Ekle'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  type="text"
                  placeholder="Kural Adı"
                  value={current.name}
                  onChange={e => setCurrent({ ...current, name: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 15 }}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Açıklama"
                  value={current.description}
                  onChange={e => setCurrent({ ...current, description: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 15 }}
                />
                <label style={{ fontSize: 14 }}>
                  Tür:
                  <select value={current.ruleType} onChange={e => setCurrent({ ...current, ruleType: e.target.value as any })} style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                    <option value="NoShow">NoShow</option>
                    <option value="Capacity">Capacity</option>
                    <option value="Pricing">Pricing</option>
                    <option value="Availability">Availability</option>
                    <option value="Notification">Notification</option>
                  </select>
                </label>
                <label style={{ fontSize: 14 }}>
                  Kapsam:
                  <select value={current.scope} onChange={e => setCurrent({ ...current, scope: e.target.value as any })} style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                    <option value="Global">Global</option>
                    <option value="Location">Location</option>
                    <option value="Floor">Floor</option>
                    <option value="Zone">Zone</option>
                    <option value="Resource">Resource</option>
                  </select>
                </label>
                <label style={{ fontSize: 14 }}>
                  Öncelik:
                  <input type="number" min={1} value={current.priority} onChange={e => setCurrent({ ...current, priority: Number(e.target.value) })} style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #e5e7eb', width: 80 }} />
                </label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={handleSave} disabled={saving || !current.name} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: 15, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
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
            Kurallar yükleniyor...
          </div>
        ) : rules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            Kural bulunamadı
          </div>
        ) : (
          <Table
            columns={columns as any}
            data={rules}
            pagination={true}
            pageSize={10}
            striped={true}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default RulesPage;
