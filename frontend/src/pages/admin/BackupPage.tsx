import React, { useState } from 'react';
import { Download } from 'lucide-react';

const BackupPage: React.FC = () => {
  const [status, setStatus] = useState('');

  const handleBackup = async () => {
    setStatus('Yedekleme başlatıldı...');
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('Yedekleme başarısız');
      const blob = await res.blob();
      // Extract filename from content-disposition
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
    } catch (e) {
      setStatus('Yedekleme başarısız!');
    }
  };
  const handleExport = () => {
    setStatus('Veri dışa aktarılıyor...');
    setTimeout(() => setStatus('Veri dışa aktarıldı!'), 2000);
  };

  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Yedekleme ve Veri Dışa Aktarma</div>
        <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Sisteminizi yedekleyin veya verileri dışa aktarın.</div>
        <div style={{display:'flex',gap:'1.5rem',marginBottom:'2rem'}}>
          <button className="page-btn" style={{display:'flex',alignItems:'center',gap:6}} onClick={handleBackup}>
            <Download size={18} /> Yedekleme Başlat
          </button>
        </div>
        {status && <div style={{color:'#22c55e',fontWeight:600,marginTop:'1rem'}}>{status}</div>}
      </div>
    </div>
  );
};

export default BackupPage;
