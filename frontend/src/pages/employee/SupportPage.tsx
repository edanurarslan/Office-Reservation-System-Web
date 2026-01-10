import React, { useState } from "react"
import { PageContainer, PageHeader } from '../../widgets';
import { HelpCircle } from 'lucide-react';

const SupportPage: React.FC = () => {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mock API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSent(true)
    setSubject("")
    setMessage("")
    setLoading(false)

    // Hide success message after 3 seconds
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Destek Talebi"
        description="Teknik destek veya yardım talebinde bulunun."
        icon={<HelpCircle />}
      />

      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.2rem" }}>
              <label style={{ fontWeight: 500, color: "#818cf8", display: 'block', marginBottom: '0.5rem' }}>Konu</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Konu"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: "1.2rem" }}>
              <label style={{ fontWeight: 500, color: "#818cf8", display: 'block', marginBottom: '0.5rem' }}>Mesaj</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Sorununuzu kısaca açıklayın"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box', minHeight: "120px", resize: 'vertical' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem 1.5rem",
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
            {sent && (
              <div style={{ marginTop: "1rem", color: "#22c55e", fontWeight: 600, textAlign: 'center' }}>
                Talebiniz alınmıştır!
              </div>
            )}
          </form>
        </div>
      </div>
    </PageContainer>
  )
}

export default SupportPage;