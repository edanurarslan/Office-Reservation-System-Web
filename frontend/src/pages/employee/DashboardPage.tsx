import React, { useEffect, useState } from 'react';
import { PageContainer, PrimaryButton } from '../../widgets';
import { 
  Plus, CloudSun, Utensils, TrendingUp, Clock, ArrowRight, Bell, Calendar, MapPin, ChevronRight, CalendarCheck
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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Merhaba, <span className="text-indigo-600">{user?.firstName || 'Employee'}</span> 👋
          </h1>
          <p className="text-slate-500 text-lg mt-2 font-medium">İşte bugün senin için ofisteki gelişmeler.</p>
        </div>
        <div className="flex items-center gap-10 justify-end">
          <button className="relative p-3 bg-white rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-100 transition-all hover:shadow-md"
          style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', fontWeight: 600 }}>
            <Bell className="w-6 h-6" />
            <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
          </button>
          <PrimaryButton 
            onClick={() => window.location.href='/employee/reservations'}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', fontWeight: 600, marginLeft: '2rem' }} 
            className="!rounded-2xl !py-4 !px-8 !bg-indigo-600 shadow-lg shadow-indigo-200 hover:!bg-indigo-700 transition-all flex items-center gap-3"
          >
            <Plus className="w-5 h-5" /> 
            <span className="font-bold text-base">Hızlı Rezervasyon</span>
          </PrimaryButton>
        </div>
      </header>

      {/* STAT ve MEAL KARTLARI */}
      <div className={styles.statGrid} style={{ marginTop: '2rem' }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Calendar size={28} /></div>
          <div className={styles.statInfo}>
            <p className={styles.statTitle}>BUGÜNKÜ REZERVASYONLAR</p>
            <p className={styles.statValue}>{loading ? '0' : todayReservations}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background:'#EEF2FF', color:'#6366F1'}}><TrendingUp size={28} /></div>
          <div className={styles.statInfo}>
            <p className={styles.statTitle}>OFİS DOLULUK ORANI</p>
            <p className={styles.statValue}>%64 <span style={{fontSize:13, color:'#10B981', fontWeight:600, marginLeft:8}}>Normal Seviye</span></p>
          </div>
        </div>
      </div>
      <div className={styles.mealCard}>
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
      </div>
      {/* Yan yana üçlü küçük kart grid */}
      <div className={styles.sideGrid}>
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
      </div>
    </PageContainer>
  );

};

export default EmployeeDashboardPage;