import React, { useState } from 'react';
import '../../styles/page-custom.css';
import { Pencil, Trash2 } from 'lucide-react';

type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const mockUsers: UserType[] = [
  { id: 'u1', name: 'Ofis Kullanıcı', email: 'user@ofis.com', role: 'User' },
  { id: 'u2', name: 'Yönetici', email: 'manager@ofis.com', role: 'Manager' },
];

const ManagerUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>(mockUsers);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [form, setForm] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [modalOpen, setModalOpen] = useState(false);

  const openEditModal = (user: UserType) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditUser(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    setUsers(users.map(u => u.id === editUser.id ? { ...u, ...form } : u));
    closeModal();
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Kullanıcı silinsin mi?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Kullanıcı Yönetimi</div>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'2rem'}}>
          <thead>
            <tr style={{background:'#eef2ff',color:'#6366f1'}}>
              <th style={{padding:'0.7rem'}}>Ad Soyad</th>
              <th style={{padding:'0.7rem'}}>Email</th>
              <th style={{padding:'0.7rem',textAlign:'right'}}>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={3} style={{textAlign:'center',color:'#818cf8',padding:'1.2rem'}}>Kullanıcı bulunamadı.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} style={{background:'#fff',color:'#312e81'}}>
                  <td style={{padding:'0.7rem'}}>{u.name}</td>
                  <td style={{padding:'0.7rem'}}>{u.email}</td>
                  <td style={{padding:'0.7rem',textAlign:'right'}}>
                    <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',marginRight:'0.5rem'}} onClick={() => openEditModal(u)}><Pencil size={16} /> Düzenle</button>
                    <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',background:'#ef4444',backgroundImage:'none'}} onClick={() => handleDelete(u.id)}><Trash2 size={16} /> Sil</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {modalOpen && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(49,46,129,0.15)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <form onSubmit={handleSubmit} style={{background:'#fff',borderRadius:'1.2rem',padding:'2rem 2.5rem',minWidth:320,boxShadow:'0 8px 32px rgba(49,46,129,0.12)',display:'flex',flexDirection:'column',gap:'1.2rem'}}>
              <div style={{fontWeight:600,fontSize:'1.2rem',color:'#6366f1',marginBottom:'0.5rem'}}>Kullanıcıyı Düzenle</div>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Ad Soyad" required style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}} />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}} />
              <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
                <button type="submit" className="page-btn" style={{flex:1}}>Kaydet</button>
                <button type="button" className="page-btn" style={{flex:1,background:'#e0e7ff',color:'#6366f1'}} onClick={closeModal}>İptal</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerUsersPage;
