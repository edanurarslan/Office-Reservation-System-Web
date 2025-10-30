import React, { useState } from 'react';
import '../../styles/page-custom.css';
import { Download } from 'lucide-react';

const BackupPage: React.FC = () => {
  const [status, setStatus] = useState('');

  const handleBackup = () => {
    setStatus('Yedekleme başlatıldı...');
    setTimeout(() => setStatus('Yedekleme tamamlandı!'), 2000);
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
          <button className="page-btn" style={{display:'flex',alignItems:'center',gap:6}} onClick={handleExport}>
            <Download size={18} /> Veri Dışa Aktar
          </button>
        </div>
        {status && <div style={{color:'#22c55e',fontWeight:600,marginTop:'1rem'}}>{status}</div>}
      </div>
    </div>
  );
};

export default BackupPage;
