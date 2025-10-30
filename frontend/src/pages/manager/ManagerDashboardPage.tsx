import React from 'react';
import '../../styles/page-custom.css';

const ManagerDashboardPage: React.FC = () => {
  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Manager Dashboard</div>
        <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Rezervasyonlar, raporlar ve onay bekleyen işlemler.</div>
        <div style={{background:'#eef2ff',borderRadius:'1rem',padding:'2rem',color:'#6366f1',textAlign:'center',fontWeight:500}}>
          Manager için özet bilgiler, grafikler ve hızlı aksiyonlar burada olacak.
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
