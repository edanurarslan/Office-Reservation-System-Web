import React, { useState } from 'react';

const SupportPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="page-center">
      <div style={{width:'100%',maxWidth:500}}>
        <div className="page-glass">
          <div className="page-title">Destek Talebi</div>
          <form onSubmit={handleSubmit} style={{marginTop:'2rem'}}>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>Konu</label><br/>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="login-custom-input" required placeholder="Konu" />
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{fontWeight:500,color:'#818cf8'}}>Mesaj</label><br/>
              <textarea value={message} onChange={e => setMessage(e.target.value)} className="login-custom-input" required placeholder="Sorununuzu kısaca açıklayın" style={{minHeight:'80px'}} />
            </div>
            <button className="page-btn" style={{width:'100%',padding:'0.7rem 1.2rem'}} type="submit">Gönder</button>
            {sent && <div style={{marginTop:'1rem',color:'#22c55e',fontWeight:600}}>Talebiniz iletildi! (mock)</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
