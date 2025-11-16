import React, { useState, useMemo } from 'react';
import { PageContainer, PageHeader, Table, TextInput } from '../../widgets';
import { Mail, Clock, Edit2, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

const ManagerUsersPage: React.FC = () => {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@company.com',
      phone: '+90 555 123 4567',
      role: 'Yazılım Geliştirici',
      department: 'Geliştirme',
      joinDate: '2023-06-15',
      status: 'active',
      lastActive: '2024-01-15T14:30:00Z',
    },
    {
      id: '2',
      name: 'Fatma Kaya',
      email: 'fatma.kaya@company.com',
      phone: '+90 555 234 5678',
      role: 'UI/UX Tasarımcı',
      department: 'Tasarım',
      joinDate: '2023-08-20',
      status: 'active',
      lastActive: '2024-01-15T16:45:00Z',
    },
    {
      id: '3',
      name: 'Can Demirel',
      email: 'can.demirel@company.com',
      phone: '+90 555 345 6789',
      role: 'Proje Yöneticisi',
      department: 'Yönetim',
      joinDate: '2023-03-10',
      status: 'active',
      lastActive: '2024-01-15T13:20:00Z',
    },
    {
      id: '4',
      name: 'Zeynep Özdemir',
      email: 'zeynep.ozdemir@company.com',
      phone: '+90 555 456 7890',
      role: 'Kalite Kontrol',
      department: 'QA',
      joinDate: '2023-09-05',
      status: 'inactive',
      lastActive: '2024-01-10T10:15:00Z',
    },
    {
      id: '5',
      name: 'Murat Şahin',
      email: 'murat.sahin@company.com',
      phone: '+90 555 567 8901',
      role: 'Veri Analisti',
      department: 'Analytics',
      joinDate: '2023-07-12',
      status: 'active',
      lastActive: '2024-01-15T15:50:00Z',
    },
    {
      id: '6',
      name: 'Elif Aydın',
      email: 'elif.aydin@company.com',
      phone: '+90 555 678 9012',
      role: 'İçerik Editörü',
      department: 'İçerik',
      joinDate: '2023-10-08',
      status: 'active',
      lastActive: '2024-01-15T11:30:00Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (hours === 0) return 'Şimdi';
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: '#dcfce7', color: '#166534', label: 'Aktif' },
    inactive: { bg: '#fee2e2', color: '#991b1b', label: 'Pasif' },
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Ad Soyad',
      render: (value: string) => (
        <div style={{ fontWeight: 600, color: '#312e81' }}>{value}</div>
      ),
    },
    {
      key: 'email',
      header: 'E-posta',
      render: (value: string) => (
        <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          {value}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Görev',
      render: (value: string) => (
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{value}</div>
      ),
    },
    {
      key: 'department',
      header: 'Departman',
      render: (value: string) => (
        <div style={{ 
          display: 'inline-block', 
          background: '#eef2ff', 
          color: '#312e81', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      render: (value: 'active' | 'inactive') => (
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
      key: 'lastActive',
      header: 'Son Aktif',
      render: (value: string) => (
        <div style={{ color: '#6b7280', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          {getTimeAgo(value)}
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
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Edit2 style={{ width: '14px', height: '14px' }} />
            Düzenle
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
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
        title="Takım Üyeleri"
        description="Ekip üyelerinizi yönetin ve işlem yapın."
      />

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <TextInput
            label="Ara"
            placeholder="Ad, e-posta veya departman ara..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
          />
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#312e81', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Durum
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
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
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
          {filteredMembers.length} üye bulundu
        </div>
      </div>

      <Table
        columns={tableColumns}
        data={filteredMembers}
      />
    </PageContainer>
  );
};

export default ManagerUsersPage;
