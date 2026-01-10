

import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Table } from '../../widgets';
import { Clock, CheckCircle, XCircle, RefreshCw, Plus, AlertTriangle } from 'lucide-react';
import api, { type ApprovalRequest } from '../../utils/services/api';

const ApprovalPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ pending: number; approved: number; rejected: number; total: number } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { status?: string; type?: string } = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      const response = await api.getApprovals(params);
      setApprovals(response.data || []);
      const statsResponse = await api.getApprovalStats();
      setStats(statsResponse);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Onaylar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    // eslint-disable-next-line
  }, [filterStatus, filterType]);

  const handleApprove = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await api.approveRequest(id, {});
      await fetchApprovals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Onaylama sırasında hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      Reservation: 'Rezervasyon',
      UserSignup: 'Kullanıcı Kaydı',
      LocationChange: 'Lokasyon Değişikliği',
      RoleChange: 'Rol Değişikliği',
      Other: 'Diğer'
    };
    return typeMap[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
      Pending: { bg: '#fef3c7', color: '#92400e', icon: <Clock style={{ width: '16px', height: '16px' }} />, label: 'Beklemede' },
      Approved: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle style={{ width: '16px', height: '16px' }} />, label: 'Onaylandı' },
      Rejected: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle style={{ width: '16px', height: '16px' }} />, label: 'Reddedildi' },
    };
    const config = statusConfig[status] || statusConfig.Pending;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', backgroundColor: config.bg, color: config.color, fontSize: '0.85rem', fontWeight: 600 }}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  const handleReject = async (id: string, reason?: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await api.rejectRequest(id, { rejectionReason: reason || 'Reddedildi' });
      await fetchApprovals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reddetme sırasında hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    {
      key: 'userName',
      label: 'Kullanıcı',
      sortable: true,
      render: (value: string) => <span style={{ fontWeight: 600, color: '#312e81' }}>{value}</span>,
    },
    {
      key: 'type',
      label: 'İstek Türü',
      sortable: true,
      render: (value: string) => (
        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#eef2ff', color: '#312e81', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {getTypeLabel(value)}
        </span>
      ),
    },
    {
      key: 'requestDate',
      label: 'İstek Tarihi',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('tr-TR'),
    },
    {
      key: 'status',
      label: 'Durum',
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (_value: any, row: ApprovalRequest) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {row.status === 'Pending' && (
            <>
              <button 
                style={{ 
                  padding: '0.5rem 0.75rem', 
                  border: '1px solid #dcfce7', 
                  borderRadius: '0.5rem', 
                  background: '#dcfce7', 
                  cursor: processingId === row.id ? 'not-allowed' : 'pointer', 
                  color: '#166534', 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  opacity: processingId === row.id ? 0.5 : 1
                }} 
                onClick={() => handleApprove(row.id)}
                disabled={processingId === row.id}
              >
                {processingId === row.id ? '...' : 'Onayla'}
              </button>
              <button 
                style={{ 
                  padding: '0.5rem 0.75rem', 
                  border: '1px solid #fee2e2', 
                  borderRadius: '0.5rem', 
                  background: '#fef2f2', 
                  cursor: processingId === row.id ? 'not-allowed' : 'pointer', 
                  color: '#991b1b', 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  opacity: processingId === row.id ? 0.5 : 1
                }} 
                onClick={() => handleReject(row.id)}
                disabled={processingId === row.id}
              >
                {processingId === row.id ? '...' : 'Reddet'}
              </button>
            </>
          )}
          {row.status !== 'Pending' && row.reviewerName && (
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              {row.reviewerName} tarafından işlendi
            </span>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = stats?.pending || approvals.filter(a => a.status === 'Pending').length;

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  };

  return (
    <PageContainer>
      <PageHeader
        title="Onay Gerektiren İşlemler"
        description="Beklemede olan onayları yönetin"
        icon={<CheckCircle style={{ width: '28px', height: '28px', color: 'white' }} />}
      />

      {/* Hata mesajı */}
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          borderRadius: '12px', 
          padding: '16px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#991b1b'
        }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* İstatistik kartları */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} color="#92400e" />
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Bekleyen</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#92400e', margin: 0 }}>{stats.pending}</p>
            </div>
          </div>
          <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={24} color="#166534" />
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Onaylanan</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#166534', margin: 0 }}>{stats.approved}</p>
            </div>
          </div>
          <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={24} color="#991b1b" />
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Reddedilen</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#991b1b', margin: 0 }}>{stats.rejected}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtreler ve aksiyonlar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="">Tüm Durumlar</option>
          <option value="Pending">Beklemede</option>
          <option value="Approved">Onaylandı</option>
          <option value="Rejected">Reddedildi</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="">Tüm Türler</option>
          <option value="Reservation">Rezervasyon</option>
          <option value="UserSignup">Kullanıcı Kaydı</option>
          <option value="LocationChange">Lokasyon Değişikliği</option>
          <option value="RoleChange">Rol Değişikliği</option>
          <option value="Other">Diğer</option>
        </select>

        <button
          onClick={fetchApprovals}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <RefreshCw size={16} />
          Yenile
        </button>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#6366f1',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <Plus size={16} />
          Yeni İstek
        </button>
      </div>

      {/* Bekleyen istek uyarısı */}
      {pendingCount > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fed7aa)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Clock style={{ width: '32px', height: '32px', color: '#92400e' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '1.1rem' }}>{pendingCount} Beklemede İstek</div>
            <div style={{ color: '#b45309', fontSize: '0.9rem' }}>Lütfen beklemede olan istekleri gözden geçirin ve onaylayın/reddedin</div>
          </div>
        </div>
      )}

      {/* Tablo */}
      <div style={{ ...containerStyle, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '16px' }}>Yükleniyor...</p>
          </div>
        ) : approvals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            <CheckCircle size={48} color="#10b981" />
            <p style={{ marginTop: '16px', fontSize: '16px' }}>Henüz onay isteği bulunmuyor</p>
          </div>
        ) : (
          <Table
            columns={columns as any}
            data={approvals}
            pagination={true}
            pageSize={10}
            striped={true}
          />
        )}
      </div>

      {/* Yeni İstek Modal */}
      {showCreateModal && (
        <CreateApprovalModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchApprovals();
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageContainer>
  );
};

// Yeni istek oluşturma modalı
const CreateApprovalModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'Reservation',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Mevcut kullanıcıyı localStorage'dan al
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      await api.createApproval({
        requesterId: user?.id || '00000000-0000-0000-0000-000000000000',
        type: formData.type,
        description: formData.description,
      });
      
      console.log('✅ Yeni istek oluşturuldu');
      onSuccess();
    } catch (err: any) {
      console.error('İstek oluşturma hatası:', err);
      setError(err.response?.data?.message || 'İstek oluşturulurken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
          Yeni Onay İsteği
        </h2>

        {error && (
          <div style={{ background: '#fee2e2', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#991b1b', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              İstek Türü
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px'
              }}
            >
              <option value="Reservation">Rezervasyon</option>
              <option value="UserSignup">Kullanıcı Kaydı</option>
              <option value="LocationChange">Lokasyon Değişikliği</option>
              <option value="RoleChange">Rol Değişikliği</option>
              <option value="Other">Diğer</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="İstek detaylarını yazın..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#6366f1',
                color: '#fff',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalPage;
