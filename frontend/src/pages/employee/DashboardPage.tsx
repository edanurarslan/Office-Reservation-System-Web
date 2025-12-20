import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, MapPin, CheckCircle, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { PageContainer, PageHeader, StatCard, PrimaryButton, SecondaryButton } from '../../widgets';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../utils/services/api';
import type { DashboardStats, Reservation } from '../../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats
        const statsData = await apiService.getDashboardStats();
        
        // Fetch user's reservations
        const reservations = await apiService.getMyReservations();

        if (!isMounted) return;
        setStats(statsData);
        setRecentReservations(reservations.slice(0, 5)); // Show only 5 recent
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Veri yükleme hatası');
          console.error('Error fetching data:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [user?.id]);

  const formatDateTime = (value?: string) => {
    if (!value) return 'Tarih bilgisi yok';
    let parsed = parseISO(value);
    if (Number.isNaN(parsed.getTime())) parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, 'd MMMM yyyy HH:mm', { locale: tr });
  };

  if (loading || !stats) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
          <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '1rem' }}>⚙️</div>
          <div>Yükleniyor...</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div style={{ background: '#fee2e2', borderRadius: '1rem', padding: '2rem', color: '#991b1b' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>❌ Hata oluştu</div>
          <div>{error}</div>
        </div>
      </PageContainer>
    );
  }

  const statusConfig: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    Confirmed: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle style={{ width: '16px', height: '16px' }} /> },
    Pending: { bg: '#fef3c7', color: '#92400e', icon: <Clock style={{ width: '16px', height: '16px' }} /> },
    Cancelled: { bg: '#fee2e2', color: '#991b1b', icon: <AlertCircle style={{ width: '16px', height: '16px' }} /> },
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Hoş geldin, ${user?.firstName}! 👋`}
        description={`${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - Bugünkü durumunuz`}
      />

      {/* Ana Stat Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard
          label="Toplam Masa"
          value={stats.totalDesks}
          icon={<MapPin style={{ width: '24px', height: '24px' }} />}
          color="blue"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          label="Müsait Masa"
          value={stats.availableDesks}
          icon={<CheckCircle style={{ width: '24px', height: '24px' }} />}
          color="green"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="Aktif Rezervasyonlarım"
          value={stats.myActiveReservations}
          icon={<Calendar style={{ width: '24px', height: '24px' }} />}
          color="blue"
          trend={{ value: 1, isPositive: true }}
        />
        <StatCard
          label="Toplantı Odası"
          value={stats.totalRooms}
          icon={<Users style={{ width: '24px', height: '24px' }} />}
          color="purple"
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Hızlı İşlemler */}
      <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f3e8ff)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#312e81', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp style={{ width: '20px', height: '20px' }} />
          Hızlı İşlemler
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <PrimaryButton onClick={() => {}} size="medium" style={{ justifyContent: 'center' }}>
            <Calendar style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
            Yeni Rezervasyon
          </PrimaryButton>
          <SecondaryButton onClick={() => {}} size="medium" style={{ justifyContent: 'center' }}>
            <MapPin style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
            QR Tarama
          </SecondaryButton>
        </div>
      </div>

      {/* Recent Reservations Chart - calculateReservationsByDay kaldırıldı */}

      {/* Son Rezervasyonlar */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(31,38,135,0.10)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#312e81', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar style={{ width: '24px', height: '24px' }} />
          Son Rezervasyonlarım
        </h2>

        {recentReservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
            <Calendar style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Henüz rezervasyonunuz yok</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentReservations.map(res => {
              const config = statusConfig[res.status] || statusConfig.Pending;
              return (
                <div
                  key={res.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem',
                    background: '#f9fafb',
                    borderRadius: '1rem',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(31,38,135,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#312e81', marginBottom: '0.5rem', fontSize: '1rem' }}>
                      {res.deskName || res.roomName || 'Kaynakta'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock style={{ width: '16px', height: '16px' }} />
                      {formatDateTime(res.startsAt)} - {format(parseISO(res.endsAt), 'HH:mm', { locale: tr })}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: config.bg,
                      color: config.color,
                      padding: '0.5rem 1rem',
                      borderRadius: '0.75rem',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    {config.icon}
                    {res.status === 'Confirmed' ? 'Onaylandı' : res.status === 'Pending' ? 'Beklemede' : 'İptal'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
