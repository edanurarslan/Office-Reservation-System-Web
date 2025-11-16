import React, { useState } from 'react';
import { PageContainer, PageHeader, PrimaryButton } from '../../widgets';
import { MapPin, Building2, Users, Navigation } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  description: string;
  capacity: number;
  available: number;
  type: 'desk' | 'room';
  floor: number;
}

const LocationsPage: React.FC = () => {
  const [locations] = useState<Location[]>([
    { id: 1, name: 'A Bloğu - 1. Kat', description: 'Açık ofis alanı', capacity: 12, available: 5, type: 'desk', floor: 1 },
    { id: 2, name: 'B Bloğu - 2. Kat', description: 'Toplantı odası', capacity: 8, available: 2, type: 'room', floor: 2 },
    { id: 3, name: 'C Bloğu - Zemin Kat', description: 'Özel ofis alanı', capacity: 4, available: 1, type: 'desk', floor: 0 },
    { id: 4, name: 'D Bloğu - 1. Kat', description: 'Açık ofis alanı', capacity: 10, available: 7, type: 'desk', floor: 1 },
    { id: 5, name: 'E Bloğu - 3. Kat', description: 'Ekip toplantı odası', capacity: 6, available: 3, type: 'room', floor: 3 },
  ]);

  const getAvailabilityColor = (available: number, capacity: number): string => {
    const percentage = (available / capacity) * 100;
    if (percentage >= 70) return '#16a34a';
    if (percentage >= 40) return '#f59e0b';
    return '#dc2626';
  };

  const getAvailabilityBg = (available: number, capacity: number): string => {
    const percentage = (available / capacity) * 100;
    if (percentage >= 70) return '#dcfce7';
    if (percentage >= 40) return '#fef3c7';
    return '#fee2e2';
  };

  return (
    <PageContainer>
      <PageHeader
        title="Konumlar"
        description="Tüm ofis konumlarını görüntüleyin ve mevcudiyeti kontrol edin."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {locations.map((location) => {
          const percentage = (location.available / location.capacity) * 100;
          const availColor = getAvailabilityColor(location.available, location.capacity);
          const availBg = getAvailabilityBg(location.available, location.capacity);

          return (
            <div
              key={location.id}
              style={{
                background: '#fff',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(31,38,135,0.10)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#312e81', marginBottom: '0.5rem' }}>
                    {location.name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    {location.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#818cf8' }}>
                    <Navigation style={{ width: '16px', height: '16px' }} />
                    Kat {location.floor}
                  </div>
                </div>
                <Building2 style={{ width: '32px', height: '32px', color: '#6366f1', opacity: 0.6 }} />
              </div>

              <div style={{ backgroundColor: availBg, borderRadius: '1rem', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users style={{ width: '18px', height: '18px', color: availColor }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#312e81' }}>Kapasite</span>
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: availColor }}>
                    {location.available}/{location.capacity}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${availColor}, ${availColor}cc)`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                  {Math.round(percentage)}% müsait
                </div>
              </div>

              <PrimaryButton onClick={() => console.log('Rezervasyon yap:', location.id)} size="medium" style={{ width: '100%' }}>
                <MapPin style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
                Rezervasyon Yap
              </PrimaryButton>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
};

export default LocationsPage;
