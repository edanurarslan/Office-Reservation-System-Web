import React, { useEffect, useState } from 'react';
import { PageContainer, PrimaryButton, AnimatedCard } from '../../widgets';
import { 
  Plus, CloudSun, Utensils, TrendingUp, Clock, ArrowRight, Bell, Calendar, MapPin, ChevronRight, CalendarCheck, LayoutDashboard
} from 'lucide-react';
import api from '../../utils/services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './DashboardPage.module.css';

// ... Mock veriler aynı kalabilir ...

const MOCK_MEALS: { day: string; menu: string; today?: boolean }[] = [
  { day: 'Pazartesi', menu: 'Sebzeli Makarna, Salata', today: false },
  { day: 'Salı', menu: 'Izgara Tavuk, Bulgur Pilavı', today: false },
  { day: 'Çarşamba', menu: 'Balık, Garnitür, Salata', today: false },
  { day: 'Perşembe', menu: 'Köfte, Patates, Yoğurt', today: false },
  { day: 'Cuma', menu: 'Pizza, Mevsim Salata', today: true }, // örnek: bugün
];

const MOCK_WEATHER = {
  city: 'İstanbul',
  temp: 21,
  desc: 'Parçalı Bulutlu',
};

const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [todayReservations, setTodayReservations] = useState(0);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <PageContainer className={styles.dashboardBg + ' min-h-screen font-sans antialiased text-slate-900 px-6 py-10 max-w-7xl mx-auto'}>
      {/* HEADER: Karşılama */}
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
              <LayoutDashboard style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
              Merhaba, {user?.firstName || 'Employee'} 👋
            </h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontSize: '14px', marginLeft: '3.5rem' }}>
            İşte bugün senin için ofisteki gelişmeler.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <button 
            style={{ 
              padding: '0.6rem 0.9rem', 
              border: 'none', 
              borderRadius: '0.75rem', 
              background: 'rgba(255,255,255,0.2)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: 'white', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Bell style={{ width: '20px', height: '20px' }} />
          </button>
          <PrimaryButton 
            onClick={() => window.location.href='/employee/reservations'}
            style={{ 
              padding: '0.6rem 1rem', 
              border: 'none', 
              borderRadius: '0.75rem', 
              background: 'rgba(255,255,255,0.95)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#6366f1', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} /> 
            <span>Hızlı Rezervasyon</span>
          </PrimaryButton>
        </div>
      </div>

      {/* STAT ve MEAL KARTLARI */}
      <div className={styles.statGrid} style={{ marginTop: '2rem' }}>
        <AnimatedCard delay={100} className={styles.statCard}>
          <div className={styles.statIcon}><Calendar size={28} /></div>
          <div className={styles.statInfo}>
            <p className={styles.statTitle}>BUGÜNKÜ REZERVASYONLAR</p>
            <p className={styles.statValue}>{loading ? '0' : todayReservations}</p>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={180} className={styles.statCard}>
          <div className={styles.statIcon} style={{background:'#EEF2FF', color:'#6366F1'}}><TrendingUp size={28} /></div>
          <div className={styles.statInfo}>
            <p className={styles.statTitle}>OFİS DOLULUK ORANI</p>
            <p className={styles.statValue}>%64 <span style={{fontSize:13, color:'#10B981', fontWeight:600, marginLeft:8}}>Normal Seviye</span></p>
          </div>
        </AnimatedCard>
      </div>
      <AnimatedCard delay={260} className={styles.mealCard}>
        <div className={styles.mealHeader}>
          <div className={styles.mealTitle}>
            <Utensils size={22} style={{color:'#F43F5E', background:'#FEE2E2', borderRadius:8, padding:4}} /> Haftalık Yemek Menüsü
          </div>
          <button style={{color:'#6366F1', fontWeight:700, fontSize:13, background:'#EEF2FF', border:'none', borderRadius:8, padding:'7px 18px', cursor:'pointer'}}>PDF Olarak İndir</button>
        </div>
        <div className={styles.mealList}>
          {MOCK_MEALS.map((meal, idx) => (
            <div key={idx} className={styles.mealItem}>
              <div className={styles.mealDay}>{meal.day}</div>
              <div style={{flex:1}}>{meal.menu}</div>
              {meal.today && <span className={styles.mealToday}>BUGÜN</span>}
            </div>
          ))}
        </div>
      </AnimatedCard>
      {/* Yan yana üçlü küçük kart grid */}
      <AnimatedCard delay={340} className={styles.sideGrid}>
        {/* WEATHER */}
        <div className={styles.sideWeather}>
          <div className={styles.sideWeatherInfo}>
            <div style={{display:'flex',alignItems:'center',gap:5,opacity:0.85,marginBottom:3}}>
              <MapPin size={13} />
              <span style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>{MOCK_WEATHER.city}</span>
            </div>
            <div style={{fontSize:19,fontWeight:800}}>{MOCK_WEATHER.temp}°C</div>
            <div style={{fontSize:12,opacity:0.85}}>{MOCK_WEATHER.desc}</div>
          </div>
          <CloudSun className={styles.sideWeatherIcon} size={54} />
        </div>
        {/* RECENT ACTIVITY */}
        <div className={styles.sideCard}>
          <div className={styles.sideTitle}><Clock size={15} style={{color:'#6366F1'}} /> Son Aktiviteler</div>
          <div className={styles.sideActivityList}>
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={styles.sideActivityItem}>
                <div className={styles.sideActivityIcon}><CalendarCheck size={15} /></div>
                <div className={styles.sideActivityInfo}>
                  <div className={styles.sideActivityName}>Ana Ofis - Masa 12</div>
                  <div className={styles.sideActivityDate}>27 Aralık, 2025</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* MARKET DATA */}
        <div className={styles.sideCard}>
          <div className={styles.sideTitle}><TrendingUp size={13} style={{color:'#10B981'}} /> Piyasalar</div>
          <div className={styles.sideMarketList}>
            <div className={styles.sideMarketItem}>
              <span style={{textTransform:'uppercase',fontWeight:700,fontSize:12,color:'#64748B'}}>USD/TRY</span>
              <span style={{fontWeight:800,fontSize:13}}>32.10</span>
              <span className={styles.sideMarketChangeDown}>-0.12%</span>
            </div>
            <div className={styles.sideMarketItem}>
              <span style={{textTransform:'uppercase',fontWeight:700,fontSize:12,color:'#64748B'}}>BIST 100</span>
              <span style={{fontWeight:800,fontSize:13}}>9.120</span>
              <span className={styles.sideMarketChangeUp}>+1.45%</span>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </PageContainer>
  );

};

export default EmployeeDashboardPage;