import React, { useState } from 'react';
import '../../styles/page-custom.css';

const mockReservations = [
  {
    id: 'r1',
    desk: 'A101',
    start: '2025-10-01',
    end: '2025-10-01',
    status: 'Confirmed',
  },
  {
    id: 'r2',
    desk: 'B202',
    start: '2025-09-15',
    end: '2025-09-15',
    status: 'Cancelled',
  },
  {
    id: 'r3',
    desk: 'C303',
    start: '2025-08-20',
    end: '2025-08-20',
    status: 'CheckedOut',
  },
  {
    id: 'r4',
    desk: 'A101',
    start: '2025-10-10',
    end: '2025-10-10',
    status: 'Pending',
  },
];

const statusOptions = ['All', 'Pending', 'Confirmed', 'Cancelled', 'CheckedOut'];

const ReservationsPage: React.FC = () => {
  const [status, setStatus] = useState('All');
  const [date, setDate] = useState('');
  const [reservations, setReservations] = useState(mockReservations);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filtered = reservations.filter(r => {
    const statusMatch = status === 'All' || r.status === status;
    const dateMatch = !date || r.start === date;
    return statusMatch && dateMatch;
  });

  const handleCancel = (id: string) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
  };

  const handleEdit = (id: string) => {
    alert('Rezervasyon düzenleme akışı (mock): ' + id);
  };

  const handleFavorite = (desk: string) => {
    setFavorites(prev => prev.includes(desk) ? prev.filter(f => f !== desk) : [...prev, desk]);
  };

  return (
    <div className="page-center">
      <div style={{width:'100%',maxWidth:600}}>
        <div className="page-glass">
          <div className="page-title">Rezervasyonlar</div>
          <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Rezervasyonlarınızı yönetin ve yeni rezervasyon oluşturun</div>
          <button className="page-btn" style={{marginBottom:'1.5rem'}}>Yeni Rezervasyon Oluştur</button>
        </div>
        <div className="page-glass">
          <div style={{marginBottom:'1.2rem',fontWeight:600,color:'#6366f1'}}>Rezervasyon Geçmişi</div>
          <div style={{display:'flex',gap:'1rem',marginBottom:'1.2rem'}}>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{padding:'0.5rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}}>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{padding:'0.5rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}} />
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#eef2ff',color:'#6366f1'}}>
                <th style={{padding:'0.7rem',borderRadius:'0.5rem'}}>Masa</th>
                <th style={{padding:'0.7rem',borderRadius:'0.5rem'}}>Başlangıç</th>
                <th style={{padding:'0.7rem',borderRadius:'0.5rem'}}>Durum</th>
                <th style={{padding:'0.7rem',borderRadius:'0.5rem'}}>Favori</th>
                <th style={{padding:'0.7rem',borderRadius:'0.5rem',textAlign:'right'}}>Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center',color:'#818cf8',padding:'1.2rem'}}>Kriterlere uygun rezervasyon bulunamadı.</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} style={{background:'#fff',color:'#312e81'}}>
                    <td style={{padding:'0.7rem'}}>{r.desk}</td>
                    <td style={{padding:'0.7rem'}}>{r.start}</td>
                    <td style={{padding:'0.7rem'}}>{r.status}</td>
                    <td style={{padding:'0.7rem',textAlign:'center'}}>
                      <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',background:favorites.includes(r.desk)?'#6366f1':'#e0e7ff',color:favorites.includes(r.desk)?'#fff':'#6366f1'}} onClick={() => handleFavorite(r.desk)}>
                        {favorites.includes(r.desk) ? 'Favori' : 'Ekle'}
                      </button>
                    </td>
                    <td style={{padding:'0.7rem',textAlign:'right'}}>
                      <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',marginRight:'0.5rem'}} onClick={() => handleEdit(r.id)}>Düzenle</button>
                      {r.status !== 'Cancelled' && (
                        <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',background:'#ef4444',backgroundImage:'none'}} onClick={() => handleCancel(r.id)}>İptal Et</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{marginTop:'2rem'}}>
            <div style={{fontWeight:600,color:'#6366f1',marginBottom:'0.7rem'}}>Favori Masalar/Odalarım</div>
            {favorites.length === 0 ? (
              <div style={{color:'#818cf8'}}>Henüz favori eklemediniz.</div>
            ) : (
              <ul style={{listStyle:'none',padding:0,margin:0}}>
                {favorites.map(f => (
                  <li key={f} style={{background:'#eef2ff',color:'#6366f1',padding:'0.7rem 1.2rem',borderRadius:'1rem',marginBottom:'0.5rem',fontWeight:500}}>{f}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;