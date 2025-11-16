import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Table, PrimaryButton, SecondaryButton } from '../../widgets';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Ahmet Yıldız', email: 'ahmet.yildiz@example.com', role: 'Çalışan', status: 'active', joinDate: '2024-01-15' },
    { id: '2', name: 'Elif Kaya', email: 'elif.kaya@example.com', role: 'Yönetmen', status: 'active', joinDate: '2024-01-20' },
    { id: '3', name: 'Mehmet Demir', email: 'mehmet.demir@example.com', role: 'Çalışan', status: 'active', joinDate: '2024-02-01' },
    { id: '4', name: 'Ayşe Çelik', email: 'ayse.celik@example.com', role: 'Çalışan', status: 'pending', joinDate: '2024-02-10' },
    { id: '5', name: 'Can Güzel', email: 'can.guzel@example.com', role: 'Çalışan', status: 'inactive', joinDate: '2024-01-25' },
    { id: '6', name: 'Zeynep Aydın', email: 'zeynep.aydin@example.com', role: 'Yönetmen', status: 'active', joinDate: '2024-01-18' },
  ]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // API çağrısı yapılacak: GET /api/admin/users
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // const response = await fetch('/api/admin/users');
        // const data = await response.json();
        // setUsers(data);
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
      active: { bg: '#dcfce7', color: '#166534', label: 'Aktif' },
      inactive: { bg: '#fee2e2', color: '#991b1b', label: 'İnaktif' },
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Beklemede' },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span style={{ 
        display: 'inline-block', 
        padding: '0.4rem 0.8rem', 
        borderRadius: '0.5rem', 
        backgroundColor: config.bg, 
        color: config.color, 
        fontSize: '0.85rem', 
        fontWeight: 600 
      }}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Ad',
      sortable: true,
      render: (value: string) => <span style={{ fontWeight: 600, color: '#312e81' }}>{value}</span>,
    },
    {
      key: 'email',
      label: 'E-posta',
      sortable: true,
      render: (value: string) => <span style={{ color: '#6b7280' }}>{value}</span>,
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (value: string) => <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#eef2ff', color: '#312e81', borderRadius: '0.25rem', fontSize: '0.85rem' }}>{value}</span>,
    },
    {
      key: 'status',
      label: 'Durum',
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'joinDate',
      label: 'Katılım Tarihi',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('tr-TR'),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (value: any, row: User) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#312e81',
            fontSize: '0.85rem',
            fontWeight: 600,
          }} onClick={() => console.log('Edit', row.id)}>
            <Edit2 style={{ width: '16px', height: '16px' }} />
            Düzenle
          </button>
          <button style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #fee2e2',
            borderRadius: '0.5rem',
            background: '#fef2f2',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#991b1b',
            fontSize: '0.85rem',
            fontWeight: 600,
          }} onClick={() => console.log('Delete', row.id)}>
            <Trash2 style={{ width: '16px', height: '16px' }} />
            Sil
          </button>
        </div>
      ),
    },
  ];

  const handleAddUser = () => {
    console.log('Add new user');
    // Modal açılacak
  };

  const handleBulkDelete = () => {
    console.log('Delete selected:', selectedRows);
    setSelectedRows([]);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Kullanıcı Yönetimi"
        description="Tüm kullanıcıları yönetin, rolleri düzenleyin ve izinleri kontrol edin."
      />

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <PrimaryButton onClick={handleAddUser} size="medium">
          <Plus style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
          Yeni Kullanıcı
        </PrimaryButton>
        {selectedRows.length > 0 && (
          <SecondaryButton onClick={handleBulkDelete} size="medium" style={{ color: '#991b1b', borderColor: '#fee2e2', background: '#fef2f2' }}>
            <Trash2 style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
            {selectedRows.length} Seçili Sil
          </SecondaryButton>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', overflowX: 'auto' }}>
        <Table
          columns={columns as any}
          data={users}
          pagination={true}
          pageSize={10}
          selectable={true}
          onSelectionChange={(ids) => setSelectedRows(ids as any)}
          striped={true}
        />
      </div>
    </PageContainer>
  );
};

export default UsersPage;
