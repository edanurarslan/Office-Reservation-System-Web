import React, { useEffect, useState } from 'react';
import { PageContainer, PrimaryButton } from '../../widgets';
import { 
  Plus, CloudSun, Utensils, TrendingUp, Clock, ArrowRight, Bell, Calendar, MapPin, ChevronRight, CalendarCheck
} from 'lucide-react';
import api from '../../utils/services/api';
import { useAuth } from '../../context/AuthContext';

// Mock Veriler
const MOCK_MEALS = [
  { day: 'Pazartesi', menu: 'Mercimek Çorbası, Tavuk Sote, Pilav', today: false },
  { day: 'Salı', menu: 'Ezogelin Çorbası, Köfte, Makarna', today: true }, // Örnek olarak Salı bugün seçildi
  { day: 'Çarşamba', menu: 'Domates Çorbası, Et Sote, Bulgur Pilavı', today: false },
  { day: 'Perşembe', menu: 'Tarhana Çorbası, Tavuk Izgara, Püre', today: false },
  { day: 'Cuma', menu: 'Yayla Çorbası, Karnıyarık, Pirinç Pilavı', today: false },
];

// Mock Hava Durumu
const MOCK_WEATHER = {
  city: 'İstanbul',
  temp: 13,
  desc: 'Parçalı Bulutlu',
};

// Mock Borsa Bilgileri
const MOCK_STOCKS = [
  { symbol: 'USD / TRY', value: '32.10', change: '-0.12%' },
  { symbol: 'BIST 100', value: '9.120', change: '+1.45%' },
];

const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [todayReservations, setTodayReservations] = useState(0);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboardStats();
        setTodayReservations(res?.todayReservations || 0);
        setRecentReservations(res?.recentReservations || []);
      } catch {
        setTodayReservations(0);
        setRecentReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <PageContainer className="bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Üst Karşılama Alanı */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Merhaba, {user?.firstName || 'Kullanıcı'} 👋
            </h1>
            <p className="text-slate-500 font-medium text-lg">Ofis operasyonlarını bugün senin için dijitalleştirdik.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="relative p-3 bg-white rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm group">
                <Bell className="w-6 h-6" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
             </button>
             <PrimaryButton 
                onClick={() => window.location.href='/employee/reservations'} 
                className="!rounded-2xl !py-3 !px-6 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
             >
                <Plus className="w-5 h-5" /> 
                <span className="font-bold">Hızlı Rezervasyon</span>
             </PrimaryButton>
          </div>
        </div>

        {/* Ana Dashboard Izgarası */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* SOL KOLON */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* Durum Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-indigo-100 transition-colors">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Bugünkü Rezervasyonlar</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{loading ? '...' : todayReservations}</p>
                </div>
              </div>

              <div className="bg-slate-900 p-7 rounded-[2rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Ofis Doluluk Oranı</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black">%64</p>
                    <span className="text-emerald-400 text-xs font-bold">Normal</span>
                  </div>
                </div>
                <div className="mt-6 relative z-10 h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-[64%] rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)]"></div>
                </div>
                {/* Arka plan dekoru */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
              </div>
            </div>

            {/* Yemek Listesi Kartı */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-7 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <Utensils className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Haftalık Menü</h3>
                </div>
                <button className="text-indigo-600 font-bold text-sm hover:underline italic">Tümünü İndir (PDF)</button>
              </div>
              <div className="divide-y divide-slate-50">
                {MOCK_MEALS.map((meal, idx) => (
                  <div key={idx} className={`p-5 flex items-center gap-6 hover:bg-slate-50/50 transition-all ${meal.today ? 'bg-rose-50/40 border-l-4 border-l-rose-500' : ''}`}>
                    <div className="w-24 shrink-0">
                        <span className={`text-xs font-black uppercase tracking-tighter ${meal.today ? 'text-rose-600' : 'text-slate-400'}`}>
                            {meal.day}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${meal.today ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                            {meal.menu}
                        </p>
                    </div>
                    {meal.today && (
                        <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full animate-pulse uppercase">Bugün</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SAĞ KOLON */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            
            {/* Hava Durumu Mini */}
            <div className="bg-gradient-to-br from-white to-indigo-50/30 p-7 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{MOCK_WEATHER.city}</p>
                  </div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{MOCK_WEATHER.desc}</p>
                  <p className="text-sm text-slate-500 font-semibold italic mt-1">Dışarı çıkmak için harika bir gün!</p>
               </div>
               <div className="text-right">
                  <CloudSun className="w-12 h-12 text-amber-400 mb-2 drop-shadow-md" />
                  <p className="text-3xl font-black text-indigo-600 tracking-tighter">{MOCK_WEATHER.temp}°C</p>
               </div>
            </div>

            {/* Son İşlemler Liste */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-7">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" /> Geçmiş Aktivite
                </h3>
              </div>
              <div className="space-y-5">
                {recentReservations.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-medium italic">Henüz bir kayıt bulunmuyor.</p>
                  </div>
                ) : (
                  recentReservations.slice(0, 4).map((r, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <CalendarCheck className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                      <div className="flex-1 border-b border-slate-50 pb-2 group-last:border-0">
                        <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{r.locationName || 'Toplantı Odası A'}</p>
                        <p className="text-xs text-slate-400 font-medium">{r.date ? new Date(r.date).toLocaleDateString('tr-TR') : '-'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))
                )}
              </div>
              <button className="w-full mt-6 py-3 text-xs font-black text-indigo-600 bg-indigo-50/50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest">
                TÜM GEÇMİŞİ GÖR
              </button>
            </div>

            {/* Borsa Widget */}
            <div className="bg-indigo-700 rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10 flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                    <TrendingUp className="w-5 h-5 text-emerald-300" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-indigo-100">Piyasalar</span>
               </div>
               <div className="relative z-10 space-y-5">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                     <span className="text-xs font-bold text-indigo-200 uppercase">USD / TRY</span>
                     <span className="font-extrabold tracking-tight">32.10</span>
                     <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-lg font-bold">-0.12%</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                     <span className="text-xs font-bold text-indigo-200 uppercase">BIST 100</span>
                     <span className="font-extrabold tracking-tight">9.120</span>
                     <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-lg font-bold">+1.45%</span>
                  </div>
               </div>
               {/* Arka plan dekoru */}
               <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
            </div>

          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default EmployeeDashboardPage;