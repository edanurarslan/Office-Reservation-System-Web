import React, { useState } from 'react';
import '../../styles/page-custom.css';
import { Check, X } from 'lucide-react';

const mockReservations = [
  { id: 'r1', user: 'Ofis Kullanıcı', desk: 'A101', date: '2025-10-31', status: 'Bekliyor' },
  { id: 'r2', user: 'Yönetici', desk: 'B202', date: '2025-11-01', status: 'Bekliyor' },
];

const ManagerReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState(mockReservations);

  const handleApprove = (id: string) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status: 'Onaylandı' } : r));
  };
  const handleReject = (id: string) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status: 'Reddedildi' } : r));
  };

  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Rezervasyon Yönetimi</div>
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
            {reservations.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center',color:'#818cf8',padding:'1.2rem'}}>Bekleyen rezervasyon yok.</td></tr>
            ) : (
              reservations.map(r => (
                <tr key={r.id} style={{background:'#fff',color:'#312e81'}}>
                  <td style={{padding:'0.7rem'}}>{r.user}</td>
                  <td style={{padding:'0.7rem'}}>{r.desk}</td>
                  <td style={{padding:'0.7rem'}}>{r.date}</td>
                  <td style={{padding:'0.7rem'}}>{r.status}</td>
                  <td style={{padding:'0.7rem',textAlign:'right'}}>
                    {r.status === 'Bekliyor' && (
                      <>
                        <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',marginRight:'0.5rem',background:'#22c55e'}} onClick={() => handleApprove(r.id)}><Check size={16} /> Onayla</button>
                        <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',background:'#ef4444',backgroundImage:'none'}} onClick={() => handleReject(r.id)}><X size={16} /> Reddet</button>
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

export default ManagerReservationsPage;
