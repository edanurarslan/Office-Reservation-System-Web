import React from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/page-custom.css';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="page-center">
      <div style={{width:'100%',maxWidth:600}}>
        <div className="page-glass">
          <div className="page-title">Profil</div>
          <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Hesap bilgilerinizi görüntüleyin ve düzenleyin</div>
          <div style={{marginTop:'2rem'}}>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>Ad</label>
              <div style={{fontWeight:600,color:'#312e81',marginTop:'0.3rem'}}>{user?.firstName}</div>
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>Soyad</label>
              <div style={{fontWeight:600,color:'#312e81',marginTop:'0.3rem'}}>{user?.lastName}</div>
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>E-posta</label>
              <div style={{fontWeight:600,color:'#312e81',marginTop:'0.3rem'}}>{user?.email}</div>
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>Rol</label>
              <div style={{fontWeight:600,color:'#312e81',marginTop:'0.3rem'}}>{user?.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;