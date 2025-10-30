import React, { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, CheckCircle, Clock, MapPin, TrendingUp, Users } from 'lucide-react';
import '../../styles/dashboard-custom.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
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
        const [statsResponse, reservationsResponse] = await Promise.allSettled([
          api.getDashboardStats(),
          api.getMyReservations(),
        ]);

        if (!isMounted) {
          return;
        }

        if (statsResponse.status === 'fulfilled') {
          setStats(statsResponse.value);
        }

        if (reservationsResponse.status === 'fulfilled') {
          const items = reservationsResponse.value ?? [];
          setRecentReservations(items.slice(0, 5));
        }

        if (statsResponse.status === 'rejected' && reservationsResponse.status === 'rejected') {
          throw new Error('Veriler alınamadı');
        }

        setError(null);
      } catch {
        if (isMounted) {
          setError('Veriler alınırken hata oluştu.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: 'Toplam Masa',
        value: stats?.totalDesks ?? '—',
        icon: MapPin,
        iconClasses: 'bg-blue-100 text-blue-600',
      },
      {
        label: 'Müsait Masa',
        value: stats?.availableDesks ?? '—',
        icon: CheckCircle,
        iconClasses: 'bg-green-100 text-green-600',
      },
      {
        label: 'Toplantı Odası',
        value: stats?.totalRooms ?? '—',
        icon: Users,
        iconClasses: 'bg-purple-100 text-purple-600',
      },
      {
        label: 'Müsait Oda',
        value: stats?.availableRooms ?? '—',
        icon: CheckCircle,
        iconClasses: 'bg-emerald-100 text-emerald-600',
      },
      {
        label: 'Aktif Rezervasyonlarım',
        value: stats?.myActiveReservations ?? '—',
        icon: Calendar,
        iconClasses: 'bg-amber-100 text-amber-600',
      },
      {
        label: 'Bugünkü Rezervasyon',
        value: stats?.todayReservations ?? '—',
        icon: TrendingUp,
        iconClasses: 'bg-rose-100 text-rose-600',
      },
    ],
    [stats],
  );

  const formatDateTime = (value?: string) => {
    if (!value) {
      return 'Tarih bilgisi yok';
    }

    let parsed = parseISO(value);
    if (Number.isNaN(parsed.getTime())) {
      parsed = new Date(value);
    }

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return format(parsed, "d MMMM yyyy HH:mm", { locale: tr });
  };

  const getStatusBadge = (status: Reservation['status']) => {
    const map: Record<string, { label: string; classes: string }> = {
      Confirmed: { label: 'Onaylandı', classes: 'bg-blue-100 text-blue-800' },
      CheckedIn: { label: 'Giriş Yapıldı', classes: 'bg-green-100 text-green-800' },
      CheckedOut: { label: 'Çıkış Yapıldı', classes: 'bg-slate-100 text-slate-800' },
      Pending: { label: 'Onay Bekliyor', classes: 'bg-amber-100 text-amber-800' },
      Cancelled: { label: 'İptal Edildi', classes: 'bg-rose-100 text-rose-800' },
      NoShow: { label: 'Katılmadı', classes: 'bg-gray-100 text-gray-800' },
      Completed: { label: 'Tamamlandı', classes: 'bg-sky-100 text-sky-800' },
    };

    return map[status] ?? { label: status, classes: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="flex h-96 items-center justify-center text-red-600">{error}</div>;
  }

  if (!stats) {
    return <div className="flex h-96 items-center justify-center text-gray-600">Veri bulunamadı.</div>;
  }

  return (
    <div style={{background:'#f8fafc',minHeight:'100vh',padding:'2rem'}}>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        <div style={{background:'#fff',borderRadius:'1.5rem',boxShadow:'0 8px 32px rgba(31,38,135,0.10)',padding:'2rem',marginBottom:'2rem'}}>
          <div style={{fontSize:'2.2rem',fontWeight:700,color:'#6366f1',marginBottom:'1rem'}}>Hoş geldin, {user?.firstName}! 👋</div>
          <div style={{color:'#6366f1',fontWeight:500,marginBottom:'1rem'}}>Bugünkü rezervasyonların ve ofis durumu</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'2rem',marginBottom:'2rem'}}>
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} style={{background:'#fff',borderRadius:'1.2rem',boxShadow:'0 4px 16px rgba(99,102,241,0.10)',padding:'1.5rem',border:'1px solid #e0e7ff',transition:'box-shadow 0.2s,transform 0.2s'}}>
              <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',background:'#eef2ff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Icon style={{width:'24px',height:'24px',color:'#6366f1'}} />
                </div>
                <div>
                  <div style={{fontSize:'1rem',color:'#6366f1',fontWeight:500}}>{label}</div>
                  <div style={{fontSize:'1.5rem',fontWeight:700,color:'#312e81'}}>{value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:'#fff',borderRadius:'1.5rem',boxShadow:'0 8px 32px rgba(31,38,135,0.10)',padding:'2rem',marginBottom:'2rem'}}>
          <div style={{fontWeight:600,fontSize:'1.2rem',marginBottom:'1rem',color:'#6366f1'}}>Son Rezervasyonlar</div>
          <div>
            {recentReservations.length === 0 && (
              <div style={{background:'#eef2ff',borderRadius:'1rem',padding:'1.5rem',textAlign:'center',color:'#3730a3',marginBottom:'1rem'}}>Henüz rezervasyon oluşturmadınız. Hızlı işlemlerden yeni bir rezervasyon oluşturabilirsiniz.</div>
            )}
            {recentReservations.map((reservation) => {
              const status = getStatusBadge(reservation.status);
              const resourceName = reservation.desk?.name || reservation.room?.name || 'Kaynak Bilgisi Yok';
              return (
                <div key={reservation.id} style={{background:'#eef2ff',borderRadius:'1.2rem',boxShadow:'0 2px 8px rgba(99,102,241,0.10)',padding:'1rem',marginBottom:'1rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                    <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'#e0e7ff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {reservation.deskId ? (
                        <MapPin style={{width:'20px',height:'20px',color:'#6366f1'}} />
                      ) : (
                        <Users style={{width:'20px',height:'20px',color:'#6366f1'}} />
                      )}
                    </div>
                    <div>
                      <div style={{fontWeight:600,color:'#312e81'}}>{resourceName}</div>
                      <div style={{fontSize:'0.95rem',color:'#6366f1'}}>
                        <Clock style={{width:'16px',height:'16px',marginRight:'4px',verticalAlign:'middle'}} />
                        {formatDateTime(reservation.startTime || (reservation as any).startsAt)} → {formatDateTime(reservation.endTime || (reservation as any).endsAt)}
                      </div>
                    </div>
                  </div>
                  <span style={{padding:'0.5rem 1rem',borderRadius:'1rem',fontSize:'0.85rem',fontWeight:600,background:'#e0e7ff',color:'#6366f1'}}>{status.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{background:'#fff',borderRadius:'1.5rem',boxShadow:'0 8px 32px rgba(31,38,135,0.10)',padding:'2rem',marginBottom:'2rem'}}>
          <div style={{fontWeight:600,fontSize:'1.2rem',marginBottom:'1rem',color:'#6366f1'}}>Hızlı İşlemler</div>
          <div style={{display:'flex',gap:'1.5rem',flexWrap:'wrap'}}>
            <button style={{background:'linear-gradient(90deg,#6366f1,#818cf8)',color:'#fff',borderRadius:'1rem',padding:'0.75rem 1.2rem',fontWeight:600,fontSize:'1rem',border:'none',boxShadow:'0 2px 8px rgba(99,102,241,0.15)',cursor:'pointer',transition:'background 0.3s,transform 0.2s',marginBottom:'1rem'}}>
              <Calendar style={{width:'24px',height:'24px',marginBottom:'6px',color:'#6366f1'}} /> Yeni Rezervasyon
            </button>
            <button style={{background:'linear-gradient(90deg,#818cf8,#6366f1)',color:'#fff',borderRadius:'1rem',padding:'0.75rem 1.2rem',fontWeight:600,fontSize:'1rem',border:'none',boxShadow:'0 2px 8px rgba(99,102,241,0.15)',cursor:'pointer',transition:'background 0.3s,transform 0.2s',marginBottom:'1rem'}}>
              <MapPin style={{width:'24px',height:'24px',marginBottom:'6px',color:'#22c55e'}} /> QR Kod Tarama
            </button>
            <button style={{background:'linear-gradient(90deg,#a21caf,#6366f1)',color:'#fff',borderRadius:'1rem',padding:'0.75rem 1.2rem',fontWeight:600,fontSize:'1rem',border:'none',boxShadow:'0 2px 8px rgba(99,102,241,0.15)',cursor:'pointer',transition:'background 0.3s,transform 0.2s',marginBottom:'1rem'}}>
              <TrendingUp style={{width:'24px',height:'24px',marginBottom:'6px',color:'#a21caf'}} /> Raporlar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
