import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { PageContainer, PageHeader } from '../../widgets';

const BackupPage: React.FC = () => {
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [restoreLoading, setRestoreLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setStatus('Yedekleme başlatıldı...');
    setStatusType('info');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/backup', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Yedekleme başarısız');
      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition');
      let filename = 'yedek.json';
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatus('Yedekleme tamamlandı!');
      setStatusType('success');
    } catch (e) {
      setStatus('Yedekleme başarısız!');
      setStatusType('error');
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setStatus('Lütfen geçerli bir .json yedek dosyası seçin.');
      setStatusType('error');
      return;
    }

    setRestoreLoading(true);
    setStatus('Yedek geri yükleniyor...');
    setStatusType('info');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/backup/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Geri yükleme başarısız');
      }

      setStatus(`✅ ${data.message}`);
      setStatusType('success');
    } catch (err: any) {
      setStatus(`❌ ${err.message || 'Geri yükleme başarısız!'}`);
      setStatusType('error');
    } finally {
      setRestoreLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Yedekleme ve Geri Yükleme"
        description="Sisteminizi yedekleyin veya önceki bir yedekten geri yükleyin."
        icon={<Database />}
      />
      
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Yedekleme Bölümü */}
        <div style={{ 
          background: '#f0fdf4', 
          borderRadius: '1rem', 
          padding: '1.5rem', 
          marginBottom: '1.5rem',
          border: '1px solid #86efac'
        }}>
          <h3 style={{ margin: '0 0 0.75rem 0', color: '#166534', fontSize: '1.1rem', fontWeight: 600 }}>
            Yedekleme
          </h3>
          <p style={{ color: '#15803d', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Tüm sistem verilerini (kullanıcılar, rezervasyonlar, kurallar, bildirimler) JSON formatında indirin.
          </p>
          <button 
            className="page-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#10b981', color: 'white' }} 
            onClick={handleBackup}
          >
            <Download size={18} /> Yedekleme Başlat
          </button>
        </div>

        {/* Geri Yükleme Bölümü */}
        <div style={{ 
          background: '#fef3c7', 
          borderRadius: '1rem', 
          padding: '1.5rem', 
          marginBottom: '1.5rem',
          border: '1px solid #fde047'
        }}>
          <h3 style={{ margin: '0 0 0.75rem 0', color: '#92400e', fontSize: '1.1rem', fontWeight: 600 }}>
            Geri Yükleme
          </h3>
          <p style={{ color: '#a16207', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Daha önce oluşturulmuş bir yedek dosyasından verileri geri yükleyin.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button 
              className="page-btn" 
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: 'white' }} 
              onClick={handleRestoreClick}
              disabled={restoreLoading}
            >
              <Upload size={18} /> {restoreLoading ? 'Yükleniyor...' : 'Yedek Dosyası Seç'}
            </button>
          </div>
          <p style={{ color: '#b45309', fontSize: '0.8rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} /> Dikkat: Mevcut veriler korunur, sadece eksik kayıtlar eklenir.
          </p>
        </div>

        {/* Status */}
        {status && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '0.75rem',
            background: statusType === 'success' ? '#dcfce7' : statusType === 'error' ? '#fee2e2' : '#e0e7ff',
            color: statusType === 'success' ? '#166534' : statusType === 'error' ? '#991b1b' : '#3730a3',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {statusType === 'success' && <CheckCircle size={18} />}
            {statusType === 'error' && <AlertCircle size={18} />}
            {status}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default BackupPage;
