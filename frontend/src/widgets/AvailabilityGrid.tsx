import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AvailableDesk {
  id: string;
  deskNumber: string;
  floorId: string;
  zoneId: string;
  zoneName: string;
  hasWindow: boolean;
  hasMonitor: boolean;
}

interface AvailableRoom {
  id: string;
  name: string;
  capacity: number;
  floorId: string;
  features: string;
}

interface AvailableResourcesData {
  availableDesks: AvailableDesk[];
  availableRooms: AvailableRoom[];
  startTime: string;
  endTime: string;
}

interface AvailabilityGridProps {
  data: AvailableResourcesData | null;
  loading?: boolean;
  error?: string | null;
}

const DeskIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 12h14M5 8h14m-7 8v4m0 0H8m4 0h4"
    />
  </svg>
);

const MeetingRoomIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M11 10h.01M7 10h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  data,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Available Resources</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Available Resources</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Available Resources</h2>
        <p className="text-gray-600">Select a time slot to see available resources</p>
      </div>
    );
  }

  const startTime = new Date(data.startTime).toLocaleString();
  const endTime = new Date(data.endTime).toLocaleString();

  const totalAvailable = data.availableDesks.length + data.availableRooms.length;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Available Resources</h2>
        <p className="text-sm text-gray-600">
          {startTime} to {endTime}
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Available Desks</p>
            <p className="text-2xl font-bold text-blue-600">{data.availableDesks.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Available Rooms</p>
            <p className="text-2xl font-bold text-purple-600">{data.availableRooms.length}</p>
          </div>
        </div>

        {/* Desks */}
        {data.availableDesks.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DeskIcon />
              Available Desks ({data.availableDesks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.availableDesks.map((desk) => (
                <div key={desk.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-sm mb-2">{desk.deskNumber}</p>
                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <p>
                      <span className="font-medium">Zone:</span> {desk.zoneName}
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="font-medium">Features:</span>
                      {desk.hasMonitor && '💻'}
                      {desk.hasWindow && '🪟'}
                      {!desk.hasMonitor && !desk.hasWindow && 'Basic'}
                    </p>
                  </div>
                  <button className="w-full text-xs bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 transition-colors">
                    Reserve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rooms */}
        {data.availableRooms.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MeetingRoomIcon />
              Available Rooms ({data.availableRooms.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.availableRooms.map((room) => (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-sm mb-2">{room.name}</p>
                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <p>
                      <span className="font-medium">Capacity:</span> {room.capacity} people
                    </p>
                    {room.features && (
                      <p>
                        <span className="font-medium">Features:</span> {room.features}
                      </p>
                    )}
                  </div>
                  <button className="w-full text-xs bg-purple-100 text-purple-700 py-2 rounded hover:bg-purple-200 transition-colors">
                    Reserve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Available Resources */}
        {totalAvailable === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">No Resources Available</p>
              <p className="text-sm text-amber-700">Try searching for a different time slot</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityGrid;
