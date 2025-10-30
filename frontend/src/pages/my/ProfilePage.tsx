import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/page-custom.css';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photo, setPhoto] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setEditMode(false);
    alert('Bilgiler güncellendi (mock)');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }
    setShowPasswordForm(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('Şifre başarıyla değiştirildi (mock)');
  };

  return (
    <div className="page-center">
      <div style={{width:'100%',maxWidth:600}}>
        <div className="page-glass">
          <div className="page-title">Profil</div>
          <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Hesap bilgilerinizi görüntüleyin ve düzenleyin</div>
          <div style={{marginTop:'2rem',textAlign:'center'}}>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>Profil Fotoğrafı</label><br/>
              <div style={{margin:'0.7rem auto'}}>
                <img src={photo || 'https://ui-avatars.com/api/?name=' + firstName + '+' + lastName + '&background=6366f1&color=fff&size=128'} alt="Profil" style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',boxShadow:'0 2px 8px #6366f133'}} />
              </div>
              {editMode && (
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{marginTop:'0.5rem'}} />
              )}
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>Ad</label><br/>
              {editMode ? (
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className="login-custom-input" style={{maxWidth:220,margin:'0.3rem auto'}} />
              ) : (
                <div style={{fontWeight:600,color:'#312e81',marginTop:'0.3rem'}}>{firstName}</div>
              )}
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>Soyad</label><br/>
              {editMode ? (
                <input value={lastName} onChange={e => setLastName(e.target.value)} className="login-custom-input" style={{maxWidth:220,margin:'0.3rem auto'}} />
              ) : (
                <div style={{fontWeight:600,color:'#312e81',marginTop:'0.3rem'}}>{lastName}</div>
              )}
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>E-posta</label><br/>
              {editMode ? (
                <input value={email} onChange={e => setEmail(e.target.value)} className="login-custom-input" style={{maxWidth:220,margin:'0.3rem auto'}} />
              ) : (
                <div style={{fontWeight:600,color:'#312e81',marginTop:'0.3rem'}}>{email}</div>
              )}
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>Rol</label><br/>
              <div style={{fontWeight:600,color:'#312e81',marginTop:'0.3rem'}}>{user?.role}</div>
            </div>
            <div style={{marginTop:'2rem',display:'flex',justifyContent:'center',gap:'1rem'}}>
              {editMode ? (
                <button className="page-btn" style={{width:'auto',padding:'0.5rem 1.2rem',marginRight:'0.7rem'}} onClick={handleSave}>Kaydet</button>
              ) : (
                <button className="page-btn" style={{width:'auto',padding:'0.5rem 1.2rem'}} onClick={() => setEditMode(true)}>Düzenle</button>
              )}
              <button className="page-btn" style={{width:'auto',padding:'0.5rem 1.2rem',background:'#818cf8',backgroundImage:'none'}} onClick={() => setShowPasswordForm(v => !v)}>
                Şifre Değiştir
              </button>
            </div>
            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} style={{marginTop:'2rem',textAlign:'left',maxWidth:320,marginLeft:'auto',marginRight:'auto',background:'#eef2ff',padding:'1.2rem',borderRadius:'1rem'}}>
                <div style={{marginBottom:'1rem'}}>
                  <label style={{fontWeight:500,color:'#818cf8'}}>Mevcut Şifre</label>
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="login-custom-input" />
                </div>
                <div style={{marginBottom:'1rem'}}>
                  <label style={{fontWeight:500,color:'#818cf8'}}>Yeni Şifre</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="login-custom-input" />
                </div>
                <div style={{marginBottom:'1rem'}}>
                  <label style={{fontWeight:500,color:'#818cf8'}}>Yeni Şifre (Tekrar)</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="login-custom-input" />
                </div>
                <button className="page-btn" style={{width:'100%',padding:'0.7rem 1.2rem'}} type="submit">Şifreyi Kaydet</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;