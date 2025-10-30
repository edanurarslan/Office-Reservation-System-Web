import React from 'react';
import '../../styles/page-custom.css';

const FloorplanPage: React.FC = () => {
  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Kat Planı Yönetimi</div>
        <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Ofis kat planlarını ve masa/oda konumlarını yönetin.</div>
        <div style={{background:'#eef2ff',borderRadius:'1rem',padding:'2rem',color:'#6366f1',textAlign:'center',fontWeight:500}}>
          Kat planı görseli ve masa/oda ekleme/düzenleme arayüzü burada olacak.
        </div>
      </div>
    </div>
  );
};

export default FloorplanPage;
