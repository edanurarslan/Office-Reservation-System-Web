import React, { useState } from 'react';
import { Users, Pencil, Trash2, Plus } from 'lucide-react';
import '../../styles/page-custom.css';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const mockUsers: User[] = [
  { id: 'u1', name: 'Admin Kullanıcı', email: 'admin@ofis.com', role: 'Admin' },
  { id: 'u2', name: 'Ofis Kullanıcı', email: 'user@ofis.com', role: 'User' },
  { id: 'u3', name: 'Yönetici', email: 'manager@ofis.com', role: 'Manager' },
];


const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'User' });

  const openAddModal = () => {
    setEditUser(null);
    setForm({ name: '', email: '', role: 'User' });
    setModalOpen(true);
  };
  const openEditModal = (user: User) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditUser(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      setUsers(users.map(u => u.id === editUser.id ? { ...u, ...form } : u));
    } else {
      setUsers([...users, { id: 'u' + (users.length + 1), ...form }]);
    }
    closeModal();
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Kullanıcı silinsin mi?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="page-center">
      <div className="page-glass" style={{width: '100%', maxWidth: 700}}>
        <div className="page-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">Kullanıcı Yönetimi</h1>
              <p className="mt-1 text-gray-600">
                Ekip üyelerini görüntüleyin, rollerini yönetin ve yeni üye ekleyin.
              </p>
            </div>
            <div className="hidden rounded-full bg-primary-50 p-3 text-primary-600 md:flex">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div style={{margin:'1.5rem 0',display:'flex',justifyContent:'flex-end'}}>
          <button className="page-btn" onClick={openAddModal} style={{display:'flex',alignItems:'center',gap:6}}>
            <Plus size={18} /> Yeni Kullanıcı
          </button>
        </div>

        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'2rem'}}>
          <thead>
            <tr style={{background:'#eef2ff',color:'#6366f1'}}>
              <th style={{padding:'0.7rem'}}>Ad Soyad</th>
              <th style={{padding:'0.7rem'}}>Email</th>
              <th style={{padding:'0.7rem'}}>Rol</th>
              <th style={{padding:'0.7rem',textAlign:'right'}}>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} style={{textAlign:'center',color:'#818cf8',padding:'1.2rem'}}>Kullanıcı bulunamadı.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} style={{background:'#fff',color:'#312e81'}}>
                  <td style={{padding:'0.7rem'}}>{u.name}</td>
                  <td style={{padding:'0.7rem'}}>{u.email}</td>
                  <td style={{padding:'0.7rem'}}>
                    <select value={u.role} onChange={e => setUsers(users.map(user => user.id === u.id ? { ...user, role: e.target.value } : user))} style={{padding:'0.4rem',borderRadius:'0.5rem',border:'1px solid #e0e7ff',background:'#eef2ff',color:'#6366f1',fontWeight:500}}>
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </td>
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
              <div style={{fontWeight:600,fontSize:'1.2rem',color:'#6366f1',marginBottom:'0.5rem'}}>
                {editUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
              </div>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Ad Soyad" required style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}} />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}} />
              <select name="role" value={form.role} onChange={handleChange} style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
              <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
                <button type="submit" className="page-btn" style={{flex:1}}>{editUser ? 'Kaydet' : 'Ekle'}</button>
                <button type="button" className="page-btn" style={{flex:1,background:'#e0e7ff',color:'#6366f1'}} onClick={closeModal}>İptal</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
