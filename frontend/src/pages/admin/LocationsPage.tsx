import React, { useState } from 'react';
import { Building, Pencil, Trash2, Plus } from 'lucide-react';
import '../../styles/page-custom.css';

type Location = {
  id: string;
  name: string;
  floor: string;
  desk: string;
};

const mockLocations: Location[] = [
  { id: 'l1', name: 'Ofis A', floor: '1. Kat', desk: 'A101' },
  { id: 'l2', name: 'Ofis B', floor: '2. Kat', desk: 'B202' },
  { id: 'l3', name: 'Ofis C', floor: '3. Kat', desk: 'C303' },
];


const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [modalOpen, setModalOpen] = useState(false);
  const [editLoc, setEditLoc] = useState<Location | null>(null);
  const [form, setForm] = useState({ name: '', floor: '', desk: '' });

  const openAddModal = () => {
    setEditLoc(null);
    setForm({ name: '', floor: '', desk: '' });
    setModalOpen(true);
  };
  const openEditModal = (loc: Location) => {
    setEditLoc(loc);
    setForm({ name: loc.name, floor: loc.floor, desk: loc.desk });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditLoc(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editLoc) {
      setLocations(locations.map(l => l.id === editLoc.id ? { ...l, ...form } : l));
    } else {
      setLocations([...locations, { id: 'l' + (locations.length + 1), ...form }]);
    }
    closeModal();
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Lokasyon silinsin mi?')) {
      setLocations(locations.filter(l => l.id !== id));
    }
  };

  return (
    <div className="page-center">
      <div className="page-glass" style={{width: '100%', maxWidth: 700}}>
        <div className="page-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">Lokasyonlar</h1>
              <p className="mt-1 text-gray-600">
                Ofis lokasyonlarını, kat planlarını ve kapasiteleri buradan yönetin.
              </p>
            </div>
            <div className="hidden rounded-full bg-primary-50 p-3 text-primary-600 md:flex">
              <Building className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div style={{margin:'1.5rem 0',display:'flex',justifyContent:'flex-end'}}>
          <button className="page-btn" onClick={openAddModal} style={{display:'flex',alignItems:'center',gap:6}}>
            <Plus size={18} /> Yeni Lokasyon
          </button>
        </div>

        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'2rem'}}>
          <thead>
            <tr style={{background:'#eef2ff',color:'#6366f1'}}>
              <th style={{padding:'0.7rem'}}>Lokasyon</th>
              <th style={{padding:'0.7rem'}}>Kat</th>
              <th style={{padding:'0.7rem'}}>Masa/Oda</th>
              <th style={{padding:'0.7rem',textAlign:'right'}}>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr><td colSpan={4} style={{textAlign:'center',color:'#818cf8',padding:'1.2rem'}}>Lokasyon bulunamadı.</td></tr>
            ) : (
              locations.map(l => (
                <tr key={l.id} style={{background:'#fff',color:'#312e81'}}>
                  <td style={{padding:'0.7rem'}}>{l.name}</td>
                  <td style={{padding:'0.7rem'}}>{l.floor}</td>
                  <td style={{padding:'0.7rem'}}>{l.desk}</td>
                  <td style={{padding:'0.7rem',textAlign:'right'}}>
                    <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',marginRight:'0.5rem'}} onClick={() => openEditModal(l)}><Pencil size={16} /> Düzenle</button>
                    <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',background:'#ef4444',backgroundImage:'none'}} onClick={() => handleDelete(l.id)}><Trash2 size={16} /> Sil</button>
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
                {editLoc ? 'Lokasyon Düzenle' : 'Yeni Lokasyon Ekle'}
              </div>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Lokasyon Adı" required style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}} />
              <input name="floor" value={form.floor} onChange={handleChange} placeholder="Kat" required style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}} />
              <input name="desk" value={form.desk} onChange={handleChange} placeholder="Masa/Oda" required style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}} />
              <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
                <button type="submit" className="page-btn" style={{flex:1}}>{editLoc ? 'Kaydet' : 'Ekle'}</button>
                <button type="button" className="page-btn" style={{flex:1,background:'#e0e7ff',color:'#6366f1'}} onClick={closeModal}>İptal</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsPage;
