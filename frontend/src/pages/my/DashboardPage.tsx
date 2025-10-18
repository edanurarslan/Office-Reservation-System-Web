import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock,
  TrendingUp,
  CheckCircle 
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock data - bu veriler gerçek API'den gelecek
  const stats = {
    totalDesks: 150,
    availableDesks: 45,
    totalRooms: 25,
    availableRooms: 8,
    myActiveReservations: 2,
    todayReservations: 12
  };

  const recentReservations = [
    {
      id: '1',
      resource: 'Masa A-15',
      type: 'Desk',
      startTime: '09:00',
      endTime: '17:00',
      status: 'Confirmed'
    },
    {
      id: '2',
      resource: 'Toplantı Odası B',
      type: 'Room',
      startTime: '14:00',
      endTime: '15:30',
      status: 'CheckedIn'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hoş geldin, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Bugünkü rezervasyonların ve ofis durumu
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Masa</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDesks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Müsait Masa</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.availableDesks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplantı Odası</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Müsait Oda</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.availableRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Rezervasyonlarım</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.myActiveReservations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bugünkü Rezervasyon</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.todayReservations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Son Rezervasyonlar</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      {reservation.type === 'Desk' ? (
                        <MapPin className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Users className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reservation.resource}</p>
                    <p className="text-sm text-gray-500">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {reservation.startTime} - {reservation.endTime}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      reservation.status === 'Confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : reservation.status === 'CheckedIn'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {reservation.status === 'Confirmed' ? 'Onaylandı' : 
                     reservation.status === 'CheckedIn' ? 'Giriş Yapıldı' : reservation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-6 h-6 text-primary-600 mb-2" />
            <p className="font-medium text-gray-900">Yeni Rezervasyon</p>
            <p className="text-sm text-gray-500">Masa veya oda rezerve et</p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MapPin className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">QR Kod Tarama</p>
            <p className="text-sm text-gray-500">Check-in/out yap</p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">Raporlar</p>
            <p className="text-sm text-gray-500">Kullanım istatistikleri</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;