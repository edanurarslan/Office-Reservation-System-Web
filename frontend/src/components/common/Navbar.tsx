import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, User, LogOut, Bell, Users, Calendar } from 'lucide-react';
import '../../styles/sidebar-navbar-custom.css';

const mockNotifications = [
  { id: 1, text: 'Yeni rezervasyonunuz onaylandı.', date: '2025-10-29' },
  { id: 2, text: 'Ofis kuralları güncellendi.', date: '2025-10-28' },
  { id: 3, text: 'Rezervasyonunuz iptal edildi.', date: '2025-10-25' },
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'Employee': return 'Çalışan';
      case 'Manager': return 'Yönetici';
      case 'Admin': return 'Admin';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Employee': return 'bg-green-100 text-green-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="navbar-glass">
      <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
        <Link to="/dashboard" style={{display:'flex',alignItems:'center',gap:'0.7rem',textDecoration:'none'}}>
          <div style={{background:'#6366f1',padding:'0.5rem',borderRadius:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Building style={{width:'28px',height:'28px',color:'#fff'}} />
          </div>
          <div>
            <span style={{fontSize:'1.3rem',fontWeight:700,color:'#6366f1'}}>Ofis Yönetim</span>
            <span style={{fontSize:'0.9rem',color:'#818cf8',display:'block',lineHeight:'1'}}>Sistemi</span>
          </div>
        </Link>
      </div>
      <div className="navbar-user-info" style={{position:'relative'}}>
        <button className="navbar-btn" style={{position:'relative'}} onClick={() => setShowNotifications(v => !v)}>
          <Bell style={{width:'20px',height:'20px'}} />
          <span style={{position:'absolute',top:'6px',right:'6px',width:'8px',height:'8px',background:'#ef4444',borderRadius:'50%'}}></span>
        </button>
        {showNotifications && (
          <div style={{position:'absolute',top:'48px',right:'0',background:'#fff',boxShadow:'0 4px 24px #6366f133',borderRadius:'1rem',minWidth:'260px',zIndex:10}}>
            <div style={{padding:'1rem',borderBottom:'1px solid #e0e7ff',fontWeight:600,color:'#6366f1'}}>Bildirimler</div>
            <ul style={{listStyle:'none',margin:0,padding:0}}>
              {mockNotifications.length === 0 ? (
                <li style={{padding:'1rem',color:'#818cf8'}}>Henüz bildiriminiz yok.</li>
              ) : (
                mockNotifications.map(n => (
                  <li key={n.id} style={{padding:'0.8rem 1rem',borderBottom:'1px solid #f3f4f6',fontSize:'0.98rem',color:'#312e81'}}>
                    <div>{n.text}</div>
                    <div style={{fontSize:'0.85rem',color:'#818cf8'}}>{n.date}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:600,color:'#6366f1'}}>{user?.firstName} {user?.lastName}</div>
          <div style={{fontSize:'0.9rem',color:'#818cf8'}}>{user?.email}</div>
        </div>
        <span className="navbar-role-badge">{getRoleDisplayName(user?.role || '')}</span>
        <Link to="/profile" className="navbar-btn" title="Profil">
          <User style={{width:'20px',height:'20px'}} />
        </Link>
        {/* Admin'e özel aksiyonlar */}
        {user?.role === 'Admin' && (
          <Link to="/users" className="navbar-btn" title="Kullanıcı Yönetimi">
            <Users style={{width:'20px',height:'20px'}} />
          </Link>
        )}
        {/* Employee'ye özel aksiyonlar */}
        {user?.role === 'Employee' && (
          <Link to="/reservations" className="navbar-btn" title="Rezervasyonlarım">
            <Calendar style={{width:'20px',height:'20px'}} />
          </Link>
        )}
        <button onClick={handleLogout} className="navbar-btn" title="Çıkış Yap">
          <LogOut style={{width:'20px',height:'20px'}} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;