import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, Table, TextInput } from '../../widgets';
import { User, FileText, Calendar, Filter, RefreshCw, Trash2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import api from '../../utils/services/api';

interface Log {
  id: string;
  timestamp: string;
  user: string;
  userName: string;
  action: string;
  resource: string;
  resourceType: string;
  entityType: string;
  entityId: string | null;
  status: 'success' | 'error' | 'warning';
  details: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface LogStats {
  totalLogs: number;
  todayLogs: number;
  weekLogs: number;
  errorLogs: number;
  actionStats: { action: string; count: number }[];
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actions, setActions] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getLogs({
        search: searchTerm || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        entityType: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
        page,
        pageSize: 50
      });
      setLogs(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Loglar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, actionFilter, statusFilter, entityTypeFilter, page]);

  const fetchFilters = useCallback(async () => {
    try {
      const [actionsData, entityTypesData, statsData] = await Promise.all([
        api.getLogActions(),
        api.getLogEntityTypes(),
        api.getLogStats()
      ]);
      setActions(actionsData);
      setEntityTypes(entityTypesData);
      setStats(statsData);
    } catch (error) {
      console.error('Filtreler yüklenirken hata:', error);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCleanup = async () => {
    if (!confirm('90 günden eski tüm logları silmek istediğinize emin misiniz?')) return;
    try {
      await api.cleanupOldLogs(90);
      fetchLogs();
      fetchFilters();
    } catch (error) {
      console.error('Log temizleme hatası:', error);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE: 'Oluştur',
      UPDATE: 'Güncelle',
      DELETE: 'Sil',
      APPROVE: 'Onayla',
      REJECT: 'Reddet',
      LOGIN: 'Giriş',
      LOGOUT: 'Çıkış',
      LOGIN_FAILED: 'Başarısız Giriş',
      EXPORT: 'Dışa Aktar',
      IMPORT: 'İçe Aktar',
      BULK_UPDATE: 'Toplu Güncelleme',
      CANCEL: 'İptal',
      CLEANUP: 'Temizlik',
      CHECKIN: 'Check-in',
      CHECKOUT: 'Check-out',
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
      desk: { bg: '#fce7f3', color: '#9d174d' },
      room: { bg: '#ccfbf1', color: '#0f766e' },
      rule: { bg: '#fef9c3', color: '#854d0e' },
      notification: { bg: '#e0e7ff', color: '#3730a3' },
      auditlog: { bg: '#f1f5f9', color: '#475569' },
    };
    return labels[type?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    success: { bg: '#dcfce7', color: '#166534', label: 'Başarılı' },
    error: { bg: '#fee2e2', color: '#991b1b', label: 'Hata' },
    warning: { bg: '#fef3c7', color: '#92400e', label: 'Uyarı' },
  };

  const tableColumns = [
    {
      key: 'timestamp',
      header: 'Zaman',
      width: '140px',
      render: (value: string) => (
        <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          {format(new Date(value), 'dd MMM HH:mm', { locale: tr })}
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Kullanıcı',
      width: '180px',
      render: (value: string, row: Log) => (
        <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <User style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          <div>
            <div>{row.userName || 'Sistem'}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{value}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'İşlem',
      width: '130px',
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
            {value || row.entityType}
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
          {value || '-'}
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
          background: statusConfig[value]?.bg || statusConfig.success.bg, 
          color: statusConfig[value]?.color || statusConfig.success.color, 
          padding: '0.25rem 0.75rem', 
          borderRadius: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {statusConfig[value]?.label || 'Başarılı'}
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

      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 16px rgba(31,38,135,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <BarChart3 style={{ width: '24px', height: '24px', color: '#6366f1' }} />
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Toplam Log</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#312e81' }}>{stats.totalLogs.toLocaleString()}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 16px rgba(31,38,135,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Calendar style={{ width: '24px', height: '24px', color: '#10b981' }} />
              <span style={{ color: '#2d323dff', fontSize: '0.9rem' }}>Bugün</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#166534' }}>{stats.todayLogs.toLocaleString()}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 16px rgba(31,38,135,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Calendar style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Bu Hafta</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0c4a6e' }}>{stats.weekLogs.toLocaleString()}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 16px rgba(31,38,135,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <FileText style={{ width: '24px', height: '24px', color: '#ef4444' }} />
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Hatalar</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#991b1b' }}>{stats.errorLogs.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#312e81', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Ara
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Kullanıcı, kaynak veya ayrıntı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  color: '#312e81',
                  fontWeight: 500,
                  boxSizing: 'border-box'
                }}
              />
              <Filter style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '18px', 
                height: '18px', 
                color: '#9ca3af',
                zIndex: 10
              }} />
            </div>
          </div>
          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#312e81', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              İşlem
            </label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                color: '#312e81',
                fontWeight: 500,
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Tümü</option>
              {actions.map(action => (
                <option key={action} value={action}>{getActionLabel(action)}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#312e81', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Kaynak Tipi
            </label>
            <select
              value={entityTypeFilter}
              onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                color: '#312e81',
                fontWeight: 500,
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Tümü</option>
              {entityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#312e81', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Durum
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                color: '#312e81',
                fontWeight: 500,
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Tümü</option>
              <option value="success">Başarılı</option>
              <option value="error">Hata</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter style={{ width: '16px', height: '16px' }} />
            {totalCount} kayıt bulundu
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={fetchLogs}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                color: '#312e81',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '18px', height: '18px' }} />
              Yenile
            </button>
            <button
              onClick={handleCleanup}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: '#fee2e2',
                border: 'none',
                borderRadius: '0.75rem',
                color: '#991b1b',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Trash2 style={{ width: '18px', height: '18px' }} />
              Eski Logları Temizle
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Yükleniyor...
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#fff', borderRadius: '1rem' }}>
          Henüz log kaydı bulunmuyor.
        </div>
      ) : (
        <>
          <Table
            columns={tableColumns}
            data={logs}
          />

          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '1rem', 
              marginTop: '2rem' 
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: page === 1 ? '#f3f4f6' : '#6366f1',
                  color: page === 1 ? '#9ca3af' : '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                Önceki
              </button>
              <span style={{ color: '#6b7280' }}>
                Sayfa {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  background: page === totalPages ? '#f3f4f6' : '#6366f1',
                  color: page === totalPages ? '#9ca3af' : '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default LogsPage;
