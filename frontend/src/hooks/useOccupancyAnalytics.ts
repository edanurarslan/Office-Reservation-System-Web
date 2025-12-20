import { useState, useCallback, useEffect } from 'react';

// Types for API responses
export interface OccupancyData {
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

export interface HeatmapEntry {
  label: string;
  occupancy: number;
  percentage: number;
  floorOrZone: string;
}

export interface HeatmapData {
  entries: HeatmapEntry[];
  unit: string;
  maxOccupancy: number;
  periodStart: string;
  periodEnd: string;
}

export interface AvailableDesk {
  id: string;
  deskNumber: string;
  floorId: string;
  zoneId: string;
  zoneName: string;
  hasWindow: boolean;
  hasMonitor: boolean;
}

export interface AvailableRoom {
  id: string;
  name: string;
  capacity: number;
  floorId: string;
  features: string;
}

export interface AvailableResourcesData {
  availableDesks: AvailableDesk[];
  availableRooms: AvailableRoom[];
  startTime: string;
  endTime: string;
}

export interface AverageDurationData {
  locationId: string;
  averageDurationMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  samplesCount: number;
  calculatedAt: string;
}

interface UseOccupancyAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

const API_BASE = 'http://localhost:5088/api/v1';

export const useOccupancyAnalytics = (
  locationId: string,
  options: UseOccupancyAnalyticsOptions = {}
) => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  // Occupancy state
  const [occupancy, setOccupancy] = useState<OccupancyData | null>(null);
  const [occupancyLoading, setOccupancyLoading] = useState(false);
  const [occupancyError, setOccupancyError] = useState<string | null>(null);

  // Heatmap state
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);

  // Available resources state
  const [availability, setAvailability] = useState<AvailableResourcesData | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Duration stats state
  const [duration, setDuration] = useState<AverageDurationData | null>(null);
  const [durationLoading, setDurationLoading] = useState(false);
  const [durationError, setDurationError] = useState<string | null>(null);

  // Get authorization token from localStorage
  const getAuthToken = () => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.token || parsed.accessToken;
    }
    return null;
  };

  // Fetch occupancy data
  const fetchOccupancy = useCallback(async () => {
    setOccupancyLoading(true);
    setOccupancyError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}/locations/${locationId}/occupancy/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch occupancy: ${response.statusText}`);
      }

      const data = await response.json();
      setOccupancy(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setOccupancyError(message);
    } finally {
      setOccupancyLoading(false);
    }
  }, [locationId]);

  // Fetch heatmap data
  const fetchHeatmap = useCallback(
    async (fromDate: Date, toDate: Date) => {
      setHeatmapLoading(true);
      setHeatmapError(null);

      try {
        const token = getAuthToken();
        const from = fromDate.toISOString();
        const to = toDate.toISOString();

        const response = await fetch(
          `${API_BASE}/locations/${locationId}/occupancy/heatmap?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch heatmap: ${response.statusText}`);
        }

        const data = await response.json();
        setHeatmap(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setHeatmapError(message);
      } finally {
        setHeatmapLoading(false);
      }
    },
    [locationId]
  );

  // Fetch available resources
  const fetchAvailableResources = useCallback(
    async (startsAt: Date, endsAt: Date) => {
      setAvailabilityLoading(true);
      setAvailabilityError(null);

      try {
        const token = getAuthToken();
        const start = startsAt.toISOString();
        const end = endsAt.toISOString();

        const response = await fetch(
          `${API_BASE}/locations/${locationId}/occupancy/available?startsAt=${encodeURIComponent(start)}&endsAt=${encodeURIComponent(end)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch available resources: ${response.statusText}`
          );
        }

        const data = await response.json();
        setAvailability(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setAvailabilityError(message);
      } finally {
        setAvailabilityLoading(false);
      }
    },
    [locationId]
  );

  // Fetch average duration statistics
  const fetchDurationStats = useCallback(
    async (days: number = 30) => {
      setDurationLoading(true);
      setDurationError(null);

      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE}/locations/${locationId}/occupancy/analytics/duration?days=${days}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch duration stats: ${response.statusText}`
          );
        }

        const data = await response.json();
        setDuration(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setDurationError(message);
      } finally {
        setDurationLoading(false);
      }
    },
    [locationId]
  );

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    // Initial fetch
    fetchOccupancy();

    // Set up interval
    const interval = setInterval(fetchOccupancy, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchOccupancy]);

  return {
    // Occupancy
    occupancy,
    occupancyLoading,
    occupancyError,
    fetchOccupancy,

    // Heatmap
    heatmap,
    heatmapLoading,
    heatmapError,
    fetchHeatmap,

    // Availability
    availability,
    availabilityLoading,
    availabilityError,
    fetchAvailableResources,

    // Duration
    duration,
    durationLoading,
    durationError,
    fetchDurationStats,
  };
};

export default useOccupancyAnalytics;
