import React, { useState } from 'react';

const ManagerLogsPage: React.FC = () => {
  const [logs] = useState([]);

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
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerLogsPage;
