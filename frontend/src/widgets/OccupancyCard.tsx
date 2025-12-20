import React from 'react';
import { AlertCircle, CheckCircle2, Users, DoorOpen } from 'lucide-react';

interface OccupancyData {
  locationId: string;
  totalDesks: number;
  occupiedDesks: number;
  availableDesks: number;
  occupancyPercentage: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  snapshotTime: string;
}

interface OccupancyCardProps {
  data: OccupancyData | null;
  loading?: boolean;
  error?: string | null;
}

export const OccupancyCard: React.FC<OccupancyCardProps> = ({
  data,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Occupancy Status</h2>
        <p className="text-sm text-gray-600 mb-4">Loading occupancy data...</p>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Occupancy Status</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Occupancy Status</h2>
        <p className="text-sm text-gray-600">No data available</p>
      </div>
    );
  }

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-green-600';
  };

  const getOccupancyBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-50';
    if (percentage >= 60) return 'bg-amber-50';
    return 'bg-green-50';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const updateTime = new Date(data.snapshotTime).toLocaleTimeString();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Occupancy Status</h2>
            <p className="text-sm text-gray-600">Last updated: {updateTime}</p>
          </div>
          {data.occupancyPercentage >= 80 ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          )}
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Overall Occupancy */}
        <div className={`p-4 rounded-lg ${getOccupancyBgColor(data.occupancyPercentage)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Occupancy</span>
            <span className={`text-2xl font-bold ${getOccupancyColor(data.occupancyPercentage)}`}>
              {data.occupancyPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(data.occupancyPercentage)}`}
              style={{ width: `${Math.min(100, data.occupancyPercentage)}%` }}
            ></div>
          </div>
        </div>

        {/* Desks Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Desks</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.totalDesks}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{data.occupiedDesks}</p>
              <p className="text-xs text-gray-600">Occupied</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.availableDesks}</p>
              <p className="text-xs text-gray-600">Available</p>
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DoorOpen className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-sm">Meeting Rooms</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{data.totalRooms}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{data.occupiedRooms}</p>
              <p className="text-xs text-gray-600">Occupied</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.availableRooms}</p>
              <p className="text-xs text-gray-600">Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyCard;
