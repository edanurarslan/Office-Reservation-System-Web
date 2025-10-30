import React, { useState } from 'react';
import '../../styles/page-custom.css';
import { Pencil, Trash2, Plus } from 'lucide-react';

type Rule = { id: string; text: string; type: 'Kural' | 'Duyuru' };
const mockRules: Rule[] = [
  { id: 'r1', text: 'Ofiste maske takmak zorunludur.', type: 'Kural' },
  { id: 'r2', text: 'Cuma günü saat 17:00’de temizlik yapılacaktır.', type: 'Duyuru' },
  { id: 'r3', text: 'Rezervasyonlar en az 1 gün önceden yapılmalıdır.', type: 'Kural' },
];

const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [form, setForm] = useState({ text: '', type: 'Kural' });

  const openAddModal = () => {
    setEditRule(null);
    setForm({ text: '', type: 'Kural' });
    setModalOpen(true);
  };
  const openEditModal = (rule: Rule) => {
    setEditRule(rule);
    setForm({ text: rule.text, type: rule.type });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditRule(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editRule) {
      setRules(rules.map(r => r.id === editRule.id ? { ...r, text: form.text, type: form.type as 'Kural' | 'Duyuru' } : r));
    } else {
      setRules([...rules, { id: 'r' + (rules.length + 1), text: form.text, type: form.type as 'Kural' | 'Duyuru' }]);
    }
    closeModal();
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Kural/Duyuru silinsin mi?')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Kurallar ve Duyurular Yönetimi</div>
        <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Rezervasyon ve ofis kullanım kurallarını, duyuruları ekleyin ve düzenleyin.</div>
        <div style={{margin:'1.5rem 0',display:'flex',justifyContent:'flex-end'}}>
          <button className="page-btn" onClick={openAddModal} style={{display:'flex',alignItems:'center',gap:6}}>
            <Plus size={18} /> Yeni Kural/Duyuru
          </button>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'2rem'}}>
          <thead>
            <tr style={{background:'#eef2ff',color:'#6366f1'}}>
              <th style={{padding:'0.7rem'}}>Tip</th>
              <th style={{padding:'0.7rem'}}>Metin</th>
              <th style={{padding:'0.7rem',textAlign:'right'}}>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr><td colSpan={3} style={{textAlign:'center',color:'#818cf8',padding:'1.2rem'}}>Kural veya duyuru bulunamadı.</td></tr>
            ) : (
              rules.map(r => (
                <tr key={r.id} style={{background:'#fff',color:'#312e81'}}>
                  <td style={{padding:'0.7rem'}}>{r.type}</td>
                  <td style={{padding:'0.7rem'}}>{r.text}</td>
                  <td style={{padding:'0.7rem',textAlign:'right'}}>
                    <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',marginRight:'0.5rem'}} onClick={() => openEditModal(r)}><Pencil size={16} /> Düzenle</button>
                    <button className="page-btn" style={{width:'auto',padding:'0.3rem 0.8rem',fontSize:'0.95rem',background:'#ef4444',backgroundImage:'none'}} onClick={() => handleDelete(r.id)}><Trash2 size={16} /> Sil</button>
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
                {editRule ? 'Kural/Duyuru Düzenle' : 'Yeni Kural/Duyuru Ekle'}
              </div>
              <select name="type" value={form.type} onChange={handleChange} style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}}>
                <option value="Kural">Kural</option>
                <option value="Duyuru">Duyuru</option>
              </select>
              <input name="text" value={form.text} onChange={handleChange} placeholder="Kural veya duyuru metni" required style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff'}} />
              <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
                <button type="submit" className="page-btn" style={{flex:1}}>{editRule ? 'Kaydet' : 'Ekle'}</button>
                <button type="button" className="page-btn" style={{flex:1,background:'#e0e7ff',color:'#6366f1'}} onClick={closeModal}>İptal</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RulesPage;
