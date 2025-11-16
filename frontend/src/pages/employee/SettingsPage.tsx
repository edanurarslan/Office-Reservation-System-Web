import React, { useState } from 'react';
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from '../../widgets';
import { Bell, Settings, Lock, Moon } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'tr',
    privacy: 'private',
    twoFactor: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Ayarlar"
        description="Profil ve uygulama ayarlarınızı yönetin."
      />

      {/* Notification Settings */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#eef2ff', width: '48px', height: '48px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell style={{ width: '28px', height: '28px', color: '#6366f1' }} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#312e81' }}>Bildirim Ayarları</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#312e81', marginBottom: '0.25rem' }}>E-posta Bildirimleri</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Sistem bildirimlerini e-posta ile alın</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: '#6366f1' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#312e81', marginBottom: '0.25rem' }}>Push Bildirimleri</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Tarayıcı push bildirimlerini etkinleştirin</div>
            </div>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
              style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: '#6366f1' }}
            />
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#f0fdf4', width: '48px', height: '48px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Moon style={{ width: '28px', height: '28px', color: '#16a34a' }} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#312e81' }}>Görünüm</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#312e81', marginBottom: '0.25rem' }}>Koyu Mod</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Koyu temanı etkinleştir (yakında)</div>
            </div>
            <input
              type="checkbox"
              checked={settings.darkMode}
              disabled
              style={{ width: '24px', height: '24px', cursor: 'not-allowed', accentColor: '#6366f1', opacity: 0.5 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#312e81', marginBottom: '0.75rem' }}>Dil</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                color: '#312e81',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy & Security Settings */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#fef3c7', width: '48px', height: '48px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock style={{ width: '28px', height: '28px', color: '#ca8a04' }} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#312e81' }}>Gizlilik ve Güvenlik</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#312e81', marginBottom: '0.75rem' }}>Gizlilik Seçeneği</label>
            <select
              value={settings.privacy}
              onChange={(e) => setSettings(prev => ({ ...prev, privacy: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                color: '#312e81',
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              <option value="public">Herkese Açık</option>
              <option value="private">Özel</option>
              <option value="contacts">Sadece Kişilerim</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#312e81', marginBottom: '0.25rem' }}>İki Faktörlü Kimlik Doğrulama</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Hesabınızı ekstra güvenlik ile koruyun</div>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactor}
              onChange={() => handleToggle('twoFactor')}
              style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: '#6366f1' }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <PrimaryButton onClick={() => console.log('Ayarlar kaydedildi')} size="medium" style={{ flex: 1 }}>
          <Settings style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
          Değişiklikleri Kaydet
        </PrimaryButton>
        <SecondaryButton onClick={() => console.log('İptal')} size="medium" style={{ flex: 1 }}>
          İptal
        </SecondaryButton>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
