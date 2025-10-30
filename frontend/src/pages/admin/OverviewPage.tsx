import React from 'react';
import '../../styles/page-custom.css';

const OverviewPage: React.FC = () => {
  // Mock data
  const totalReservations = 124;
  const totalDesks = 40;
  const occupiedDesks = 32;
  const occupancyRate = Math.round((occupiedDesks / totalDesks) * 100);
  const lastWeekReservations = [12, 18, 15, 20, 17, 22, 20];
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Genel Bakış</div>
        <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Ofis rezervasyonları, doluluk oranı ve istatistikleri görüntüleyin.</div>
        <div style={{display:'flex',gap:'1.5rem',marginBottom:'2rem'}}>
          <div style={{background:'#eef2ff',borderRadius:'1rem',padding:'1.2rem 2rem',color:'#6366f1',fontWeight:600,minWidth:140,textAlign:'center'}}>
            <div style={{fontSize:'2rem'}}>{totalReservations}</div>
            <div>Toplam Rezervasyon</div>
          </div>
          <div style={{background:'#eef2ff',borderRadius:'1rem',padding:'1.2rem 2rem',color:'#6366f1',fontWeight:600,minWidth:140,textAlign:'center'}}>
            <div style={{fontSize:'2rem'}}>{occupancyRate}%</div>
            <div>Doluluk Oranı</div>
          </div>
          <div style={{background:'#eef2ff',borderRadius:'1rem',padding:'1.2rem 2rem',color:'#6366f1',fontWeight:600,minWidth:140,textAlign:'center'}}>
            <div style={{fontSize:'2rem'}}>{totalDesks}</div>
            <div>Toplam Masa/Oda</div>
          </div>
        </div>
        <div style={{background:'#eef2ff',borderRadius:'1rem',padding:'2rem',color:'#6366f1',textAlign:'center',fontWeight:500}}>
          <div style={{fontWeight:600,marginBottom:'1rem'}}>Son 7 Gün Rezervasyon Grafiği</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:'0.7rem',height:120,justifyContent:'center'}}>
            {lastWeekReservations.map((val, i) => (
              <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',height:'100%'}}>
                <div style={{background:'#6366f1',width:'18px',height:`${val*4}px`,borderRadius:'0.5rem',marginBottom:'0.3rem'}}></div>
                <div style={{fontSize:'0.95rem',color:'#6366f1'}}>{days[i]}</div>
                <div style={{fontSize:'0.95rem',color:'#6366f1'}}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
