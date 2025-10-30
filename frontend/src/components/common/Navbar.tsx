import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, User, LogOut, Bell } from 'lucide-react';
import '../../styles/sidebar-navbar-custom.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

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
      <div className="navbar-user-info">
        <button className="navbar-btn" style={{position:'relative'}}>
          <Bell style={{width:'20px',height:'20px'}} />
          <span style={{position:'absolute',top:'6px',right:'6px',width:'8px',height:'8px',background:'#ef4444',borderRadius:'50%'}}></span>
        </button>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:600,color:'#6366f1'}}>{user?.firstName} {user?.lastName}</div>
          <div style={{fontSize:'0.9rem',color:'#818cf8'}}>{user?.email}</div>
        </div>
        <span className="navbar-role-badge">{getRoleDisplayName(user?.role || '')}</span>
        <Link to="/profile" className="navbar-btn" title="Profil">
          <User style={{width:'20px',height:'20px'}} />
        </Link>
        <button onClick={handleLogout} className="navbar-btn" title="Çıkış Yap">
          <LogOut style={{width:'20px',height:'20px'}} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;