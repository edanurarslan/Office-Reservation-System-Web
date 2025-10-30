import React from 'react';
import '../../styles/page-custom.css';

const mockTrends = [
  { label: 'Haftalık Rezervasyon Artışı', value: '+12%' },
  { label: 'En Yoğun Gün', value: 'Çarşamba' },
  { label: 'En Çok Kullanılan Masa', value: 'A101' },
  { label: 'Son 30 Gün Rezervasyon', value: '320' },
];

const ReportsPage: React.FC = () => {
  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Analitik Dashboard</div>
        <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Rezervasyon trendleri, en yoğun günler ve masa/oda kullanım analizleri.</div>
        <div style={{display:'flex',gap:'1.5rem',marginBottom:'2rem',flexWrap:'wrap'}}>
          {mockTrends.map((t, i) => (
            <div key={i} style={{background:'#eef2ff',borderRadius:'1rem',padding:'1.2rem 2rem',color:'#6366f1',fontWeight:600,minWidth:180,textAlign:'center'}}>
              <div style={{fontSize:'1.3rem',marginBottom:'0.5rem'}}>{t.value}</div>
              <div>{t.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:'#eef2ff',borderRadius:'1rem',padding:'2rem',color:'#6366f1',textAlign:'center',fontWeight:500}}>
          <div style={{fontWeight:600,marginBottom:'1rem'}}>Son 30 Gün Rezervasyon Grafiği</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:'0.7rem',height:120,justifyContent:'center'}}>
            {[12, 18, 15, 20, 17, 22, 20, 25, 28, 30, 32, 29, 27, 24, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4].map((val, i) => (
              <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',height:'100%'}}>
                <div style={{background:'#6366f1',width:'12px',height:`${val*3}px`,borderRadius:'0.5rem',marginBottom:'0.3rem'}}></div>
                <div style={{fontSize:'0.85rem',color:'#6366f1'}}>{i+1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
