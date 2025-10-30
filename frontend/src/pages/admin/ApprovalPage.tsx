import React, { useState } from 'react';
import '../../styles/page-custom.css';
import { Check, X } from 'lucide-react';

const mockApprovals = [
  { id: 'a1', user: 'Ofis Kullanıcı', desk: 'A101', date: '2025-10-31', status: 'Bekliyor' },
  { id: 'a2', user: 'Yönetici', desk: 'B202', date: '2025-11-01', status: 'Bekliyor' },
];

const ApprovalPage: React.FC = () => {
  const [approvals, setApprovals] = useState(mockApprovals);

  const handleApprove = (id: string) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'Onaylandı' } : a));
  };
  const handleReject = (id: string) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'Reddedildi' } : a));
  };

  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Rezervasyon Onay/İptal</div>
        <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Bekleyen rezervasyonları onaylayın veya reddedin.</div>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'2rem'}}>
          <thead>
            <tr style={{background:'#eef2ff',color:'#6366f1'}}>
              <th style={{padding:'0.7rem'}}>Kullanıcı</th>
              <th style={{padding:'0.7rem'}}>Masa/Oda</th>
              <th style={{padding:'0.7rem'}}>Tarih</th>
              <th style={{padding:'0.7rem'}}>Durum</th>
              <th style={{padding:'0.7rem',textAlign:'right'}}>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {approvals.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center',color:'#818cf8',padding:'1.2rem'}}>Bekleyen rezervasyon yok.</td></tr>
            ) : (
              approvals.map(a => (
                <tr key={a.id} style={{background:'#fff',color:'#312e81'}}>
                  <td style={{padding:'0.7rem'}}>{a.user}</td>
                  <td style={{padding:'0.7rem'}}>{a.desk}</td>
                  <td style={{padding:'0.7rem'}}>{a.date}</td>
                  <td style={{padding:'0.7rem'}}>{a.status}</td>
                  <td style={{padding:'0.7rem',textAlign:'right'}}>
                    {a.status === 'Bekliyor' && (
                      <>
                        <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',marginRight:'0.5rem',background:'#22c55e'}} onClick={() => handleApprove(a.id)}><Check size={16} /> Onayla</button>
                        <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',background:'#ef4444',backgroundImage:'none'}} onClick={() => handleReject(a.id)}><X size={16} /> Reddet</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalPage;
