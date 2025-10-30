import React, { useState } from 'react';
import '../../styles/page-custom.css';

const mockLogs = [
  { id: 'log1', user: 'Ofis Kullanıcı', action: 'Rezervasyon oluşturdu', date: '2025-10-29 15:10' },
  { id: 'log2', user: 'Yönetici', action: 'Kural güncelledi', date: '2025-10-30 09:45' },
];

const ManagerLogsPage: React.FC = () => {
  const [logs] = useState(mockLogs);

  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Log ve Aktivite Geçmişi</div>
        <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Sistem aktivitelerini ve geçmiş işlemleri görüntüleyin.</div>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'2rem'}}>
          <thead>
            <tr style={{background:'#eef2ff',color:'#6366f1'}}>
              <th style={{padding:'0.7rem'}}>Kullanıcı</th>
              <th style={{padding:'0.7rem'}}>İşlem</th>
              <th style={{padding:'0.7rem'}}>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={3} style={{textAlign:'center',color:'#818cf8',padding:'1.2rem'}}>Log kaydı yok.</td></tr>
            ) : (
              logs.map(l => (
                <tr key={l.id} style={{background:'#fff',color:'#312e81'}}>
                  <td style={{padding:'0.7rem'}}>{l.user}</td>
                  <td style={{padding:'0.7rem'}}>{l.action}</td>
                  <td style={{padding:'0.7rem'}}>{l.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerLogsPage;
