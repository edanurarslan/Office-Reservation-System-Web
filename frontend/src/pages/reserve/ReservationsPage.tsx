import React from 'react';
import '../../styles/page-custom.css';

const ReservationsPage: React.FC = () => {
  return (
    <div className="page-center">
      <div style={{width:'100%',maxWidth:600}}>
        <div className="page-glass">
          <div className="page-title">Rezervasyonlar</div>
          <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Rezervasyonlarınızı yönetin ve yeni rezervasyon oluşturun</div>
          <button className="page-btn" style={{marginBottom:'1.5rem'}}>Yeni Rezervasyon Oluştur</button>
        </div>
        <div className="page-glass">
          <p style={{textAlign:'center',color:'#818cf8',fontWeight:500}}>Rezervasyon yönetimi yakında eklenecek...</p>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;