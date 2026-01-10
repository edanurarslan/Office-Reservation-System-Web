import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, AnimatedCard } from '../../widgets';
import { 
  Users, MapPin, Calendar, TrendingUp, Activity, Clock, 
  CheckCircle, AlertCircle, ArrowUpRight,
  Building, Zap, Shield, BarChart3
} from 'lucide-react';
import api from '../../utils/services/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalLocations: number;
  totalReservations: number;
  todayReservations: number;
  pendingApprovals: number;
}

const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalLocations: 0,
    totalReservations: 0,
    todayReservations: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersResponse = await api.getUsers({});
        const users = usersResponse?.data || [];
        
        let locations: any[] = [];
        try {
          const locationsResponse = await api.getLocations();
          locations = Array.isArray(locationsResponse) ? locationsResponse : ((locationsResponse as any)?.data || []);
        } catch (e) {
          console.log('Locations fetch error:', e);
        }

        let reservations: any[] = [];
        try {
          const reservationsResponse = await api.getReservations();
          reservations = Array.isArray(reservationsResponse) ? reservationsResponse : ((reservationsResponse as any)?.data || []);
        } catch (e) {
          console.log('Reservations fetch error:', e);
        }

        const today = new Date().toISOString().split('T')[0];
        const todayReservations = reservations.filter((r: any) => 
          r.date?.startsWith(today) || r.startDate?.startsWith(today)
        );

        const pendingApprovals = reservations.filter((r: any) => 
          r.status === 'pending' || r.status === 'Pending'
        );

        setStats({
          totalUsers: usersResponse?.totalCount || users.length,
          activeUsers: users.filter((u: any) => u.status === 'active').length,
          totalLocations: locations.length,
          totalReservations: reservations.length,
          todayReservations: todayReservations.length,
          pendingApprovals: pendingApprovals.length
        });
      } catch (error) {
        console.error('Dashboard stats yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Toplam Kullanıcı', value: stats.totalUsers, icon: Users, color: '#3B82F6', bgColor: '#EFF6FF', action: '/admin/users' },
    { title: 'Aktif Kullanıcı', value: stats.activeUsers, icon: CheckCircle, color: '#10B981', bgColor: '#ECFDF5', action: '/admin/users' },
    { title: 'Toplam Konum', value: stats.totalLocations, icon: MapPin, color: '#8B5CF6', bgColor: '#F5F3FF', action: '/admin/locations' },
    { title: 'Bugünkü Rezervasyon', value: stats.todayReservations, icon: Calendar, color: '#F59E0B', bgColor: '#FFFBEB', action: '/admin/approval' },
    { title: 'Toplam Rezervasyon', value: stats.totalReservations, icon: BarChart3, color: '#EC4899', bgColor: '#FDF2F8', action: '/admin/approval' },
    { title: 'Bekleyen Onay', value: stats.pendingApprovals, icon: AlertCircle, color: '#EF4444', bgColor: '#FEF2F2', action: '/admin/approval' },
  ];

  const quickActions = [
    { title: 'Kullanıcı Yönetimi', icon: Users, href: '/admin/users', color: '#3B82F6' },
    { title: 'Konum Yönetimi', icon: MapPin, href: '/admin/locations', color: '#8B5CF6' },
    { title: 'Onay Bekleyenler', icon: CheckCircle, href: '/admin/approval', color: '#10B981' },
    { title: 'Sistem Logları', icon: Activity, href: '/admin/logs', color: '#F59E0B' },
    { title: 'Kat Planı', icon: Building, href: '/admin/floorplan', color: '#EC4899' },
    { title: 'Kurallar', icon: Shield, href: '/admin/rules', color: '#6366F1' },
  ];

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E7EB',
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '50px',
    padding: '32px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    minHeight: 'calc(100vh - 140px)',
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={containerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <Zap style={{ width: '48px', height: '48px', color: '#6366F1', animation: 'pulse 2s infinite' }} />
              <p style={{ marginTop: '16px', color: '#6B7280', fontSize: '16px' }}>Yükleniyor...</p>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          borderRadius: '1.5rem',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '20%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                Hoş Geldiniz, Admin 👋
              </h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontSize: '14px', marginLeft: '3.5rem' }}>
              {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            padding: '12px 20px', 
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            zIndex: 1
          }}>
            <Clock style={{ width: '20px', height: '20px', color: 'white' }} />
            <span style={{ fontSize: '18px', fontWeight: '600', color: 'white', fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString('tr-TR')}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
          {statCards.map((card, index) => (
            <AnimatedCard
              key={index}
              delay={index * 80}
              onClick={() => navigate(card.action)}
              style={{
                ...cardStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <card.icon style={{ width: '28px', height: '28px', color: card.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>{card.title}</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937', margin: '4px 0 0 0' }}>{card.value}</p>
              </div>
              <ArrowUpRight style={{ width: '20px', height: '20px', color: '#10B981' }} />
            </AnimatedCard>
          ))}
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Quick Actions */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>Hızlı İşlemler</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.href)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '20px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#F9FAFB',
                    border: '2px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#EEF2FF';
                    e.currentTarget.style.borderColor = '#C7D2FE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${action.color}40`,
                  }}>
                    <action.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151', textAlign: 'center' }}>
                    {action.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>Sistem Durumu</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'API Sunucusu', status: 'Aktif', color: '#10B981', bgColor: '#ECFDF5' },
                { name: 'Veritabanı', status: 'Bağlı', color: '#3B82F6', bgColor: '#EFF6FF' },
                { name: 'Önbellek', status: 'Çalışıyor', color: '#8B5CF6', bgColor: '#F5F3FF' },
              ].map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    backgroundColor: item.bgColor,
                    border: `1px solid ${item.color}20`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}`,
                    }} />
                    <span style={{ fontWeight: '500', color: '#374151' }}>{item.name}</span>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: item.color,
                    backgroundColor: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}

              {/* Server Load */}
              <div style={{ marginTop: '8px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>Sunucu Yükü</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>23%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '23%', height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div style={{ ...cardStyle, marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>Son Aktiviteler</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { text: 'Yeni kullanıcı kaydoldu', time: '5 dk önce', color: '#3B82F6' },
              { text: 'Rezervasyon onaylandı', time: '12 dk önce', color: '#10B981' },
              { text: 'Sistem yedeklemesi tamamlandı', time: '1 saat önce', color: '#8B5CF6' },
              { text: 'Yeni konum eklendi', time: '2 saat önce', color: '#F59E0B' },
            ].map((activity, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: activity.color,
                  flexShrink: 0,
                }} />
                <div style={{ 
                  flex: 1, 
                  padding: '12px 16px', 
                  backgroundColor: '#F9FAFB', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>{activity.text}</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default OverviewPage;
