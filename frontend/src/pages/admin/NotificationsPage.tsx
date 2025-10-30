import React, { useState } from 'react';
import '../../styles/page-custom.css';
import { Send } from 'lucide-react';

const mockRecipients = [
  { id: 'u1', name: 'Admin Kullanıcı', email: 'admin@ofis.com' },
  { id: 'u2', name: 'Ofis Kullanıcı', email: 'user@ofis.com' },
  { id: 'u3', name: 'Yönetici', email: 'manager@ofis.com' },
];

const NotificationsPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 2000);
    setMessage('');
    setSelected([]);
  };

  const toggleRecipient = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  return (
    <div className="page-center">
      <div className="page-glass" style={{maxWidth:700}}>
        <div className="page-title">Toplu Bildirim Gönder</div>
        <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1.2rem'}}>Kullanıcılara toplu bildirim veya duyuru gönderin.</div>
        <form onSubmit={handleSend} style={{display:'flex',flexDirection:'column',gap:'1.2rem'}}>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Bildirim veya duyuru metni" required style={{padding:'0.7rem',borderRadius:'0.7rem',border:'1px solid #e0e7ff',minHeight:80}} />
          <div style={{fontWeight:600,color:'#6366f1'}}>Alıcılar</div>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
            {mockRecipients.map(r => (
              <label key={r.id} style={{background:selected.includes(r.id)?'#6366f1':'#eef2ff',color:selected.includes(r.id)?'#fff':'#6366f1',padding:'0.7rem 1.2rem',borderRadius:'1rem',cursor:'pointer',fontWeight:500}}>
                <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleRecipient(r.id)} style={{marginRight:8}} />
                {r.name}
              </label>
            ))}
          </div>
          <button type="submit" className="page-btn" style={{display:'flex',alignItems:'center',gap:6}}>
            <Send size={18} /> Bildirimi Gönder
          </button>
          {sent && <div style={{color:'#22c55e',fontWeight:600,marginTop:'1rem'}}>Bildirim gönderildi!</div>}
        </form>
      </div>
    </div>
  );
};

export default NotificationsPage;
