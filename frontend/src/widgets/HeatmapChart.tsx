import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HeatmapEntry {
  label: string;
  occupancy: number;
  percentage: number;
  floorOrZone: string;
}

interface HeatmapData {
  entries: HeatmapEntry[];
  unit: string;
  maxOccupancy: number;
  periodStart: string;
  periodEnd: string;
}

interface HeatmapChartProps {
  data: HeatmapData | null;
  loading?: boolean;
  error?: string | null;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Occupancy Heatmap</h2>
        <div className="animate-pulse flex items-center justify-center h-80 bg-gray-200 rounded">
          <p className="text-gray-600">Loading heatmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Occupancy Heatmap</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!data || data.entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Occupancy Heatmap</h2>
        <div className="flex items-center justify-center h-80 bg-gray-50 rounded text-gray-500">
          <p>No occupancy data available for the selected period</p>
        </div>
      </div>
    );
  }

  const periodStart = new Date(data.periodStart).toLocaleDateString();
  const periodEnd = new Date(data.periodEnd).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Occupancy Heatmap</h2>
        <p className="text-sm text-gray-600">
          {periodStart} to {periodEnd} ({data.unit})
        </p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data.entries}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={Math.floor(data.entries.length / 10) || 0}
            />
            <YAxis
              label={{ value: 'Occupancy Count', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="occupancy"
              fill="#3b82f6"
              name="Occupancy"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Max Occupancy</p>
            <p className="text-2xl font-bold text-blue-600">{data.maxOccupancy}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Average Occupancy</p>
            <p className="text-2xl font-bold text-amber-600">
              {data.entries.length > 0
                ? (
                    data.entries.reduce((sum, e) => sum + e.occupancy, 0) /
                    data.entries.length
                  ).toFixed(1)
                : '0'}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Data Points</p>
            <p className="text-2xl font-bold text-green-600">{data.entries.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
