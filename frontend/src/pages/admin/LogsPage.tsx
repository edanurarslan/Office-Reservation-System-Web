import React, { useState, useMemo } from 'react';
import { PageContainer, PageHeader, Table, TextInput } from '../../widgets';
import { Search, User, FileText, Calendar, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Log {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceType: string;
  status: 'success' | 'error' | 'warning';
  details: string;
}

const LogsPage: React.FC = () => {
  const [logs] = useState<Log[]>([
    {
      id: '1',
      timestamp: '2024-01-15T14:30:00Z',
      user: 'ahmet.yilmaz@company.com',
      action: 'create',
      resource: 'A101',
      resourceType: 'reservation',
      status: 'success',
      details: 'A101 masası için rezervasyon oluşturuldu',
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:25:00Z',
      user: 'fatma.kaya@company.com',
      action: 'update',
      resource: 'User#5',
      resourceType: 'user',
      status: 'success',
      details: 'Kullanıcı profili güncellendi',
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:20:00Z',
      user: 'admin@company.com',
      action: 'delete',
      resource: 'Location#3',
      resourceType: 'location',
      status: 'success',
      details: 'Ofis konumu silindi',
    },
    {
      id: '4',
      timestamp: '2024-01-15T14:15:00Z',
      user: 'can.demirel@company.com',
      action: 'approve',
      resource: 'Reservation#42',
      resourceType: 'reservation',
      status: 'success',
      details: 'Rezervasyon onaylandı',
    },
    {
      id: '5',
      timestamp: '2024-01-15T14:10:00Z',
      user: 'zeynep.ozdemir@company.com',
      action: 'login',
      resource: 'System',
      resourceType: 'auth',
      status: 'success',
      details: 'Başarılı giriş',
    },
    {
      id: '6',
      timestamp: '2024-01-15T14:05:00Z',
      user: 'murat.sahin@company.com',
      action: 'export',
      resource: 'Reports',
      resourceType: 'report',
      status: 'success',
      details: 'Raporlar PDF olarak dışa aktarıldı',
    },
    {
      id: '7',
      timestamp: '2024-01-15T13:55:00Z',
      user: 'elif.aydin@company.com',
      action: 'failed_login',
      resource: 'System',
      resourceType: 'auth',
      status: 'error',
      details: 'Hatalı şifre ile giriş denemesi',
    },
    {
      id: '8',
      timestamp: '2024-01-15T13:45:00Z',
      user: 'admin@company.com',
      action: 'bulk_update',
      resource: 'Users (15)',
      resourceType: 'user',
      status: 'success',
      details: '15 kullanıcının rolü toplu olarak güncellendi',
    },
    {
      id: '9',
      timestamp: '2024-01-15T13:30:00Z',
      user: 'ahmet.yilmaz@company.com',
      action: 'cancel',
      resource: 'Reservation#38',
      resourceType: 'reservation',
      status: 'warning',
      details: 'Rezervasyon iptal edildi',
    },
    {
      id: '10',
      timestamp: '2024-01-15T13:20:00Z',
      user: 'system@company.com',
      action: 'backup',
      resource: 'Database',
      resourceType: 'system',
      status: 'success',
      details: 'Otomatik veritabanı yedeklemesi başarılı',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [searchTerm, actionFilter, statusFilter]);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Oluştur',
      update: 'Güncelle',
      delete: 'Sil',
      approve: 'Onayla',
      reject: 'Reddet',
      login: 'Giriş',
      logout: 'Çıkış',
      export: 'Dışa Aktar',
      import: 'İçe Aktar',
      failed_login: 'Başarısız Giriş',
      bulk_update: 'Toplu Güncelleme',
      cancel: 'İptal',
      backup: 'Yedekleme',
    };
    return labels[action] || action;
  };

  const getResourceTypeLabel = (type: string) => {
    const labels: Record<string, { bg: string; color: string }> = {
      reservation: { bg: '#eef2ff', color: '#312e81' },
      user: { bg: '#f3e8ff', color: '#6b21a8' },
      location: { bg: '#dcfce7', color: '#166534' },
      auth: { bg: '#fef3c7', color: '#92400e' },
      report: { bg: '#dbeafe', color: '#0c4a6e' },
      system: { bg: '#f5f3ff', color: '#4f46e5' },
    };
    return labels[type] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    success: { bg: '#dcfce7', color: '#166534', label: 'Başarılı' },
    error: { bg: '#fee2e2', color: '#991b1b', label: 'Hata' },
    warning: { bg: '#fef3c7', color: '#92400e', label: 'Uyarı' },
  };

  const actions = Array.from(new Set(logs.map(l => l.action))).sort();

  const tableColumns = [
    {
      key: 'timestamp',
      header: 'Zaman',
      width: '140px',
      render: (value: string) => (
        <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          {format(parseISO(value), 'dd MMM HH:mm', { locale: tr })}
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Kullanıcı',
      width: '180px',
      render: (value: string) => (
        <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <User style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          {value}
        </div>
      ),
    },
    {
      key: 'action',
      header: 'İşlem',
      width: '120px',
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
          {getActionLabel(value)}
        </div>
      ),
    },
    {
      key: 'resource',
      header: 'Kaynak',
      width: '150px',
      render: (value: string, row: Log) => {
        const config = getResourceTypeLabel(row.resourceType);
        return (
          <div style={{ 
            display: 'inline-block', 
            background: config.bg, 
            color: config.color, 
            padding: '0.25rem 0.75rem', 
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            {value}
          </div>
        );
      },
    },
    {
      key: 'details',
      header: 'Ayrıntılar',
      render: (value: string) => (
        <div style={{ color: '#6b7280', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      width: '100px',
      render: (value: 'success' | 'error' | 'warning') => (
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
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Sistem Günlükleri"
        description="Sistem aktivitesini ve işlemlerini izleyin."
      />

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <TextInput
            label="Ara"
            placeholder="Kullanıcı, kaynak veya ayrıntı ara..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
          />
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#312e81', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              İşlem
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
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
              {actions.map(action => (
                <option key={action} value={action}>{getActionLabel(action)}</option>
              ))}
            </select>
          </div>
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
              <option value="success">Başarılı</option>
              <option value="error">Hata</option>
              <option value="warning">Uyarı</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter style={{ width: '16px', height: '16px' }} />
          {filteredLogs.length} kayıt bulundu
        </div>
      </div>

      <Table
        columns={tableColumns}
        data={filteredLogs}
      />
    </PageContainer>
  );
};

export default LogsPage;
