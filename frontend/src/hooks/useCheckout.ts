import { useState, useCallback } from 'react';

export interface CheckOutResult {
  checkOutId: string;
  reservationId: string;
  checkOutTime: string;
  durationMinutes: number;
  status: string;
  message: string;
}

const API_BASE = 'http://localhost:5088/api/v1';

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckOutResult | null>(null);

  // Get authorization token from localStorage
  const getAuthToken = () => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.token || parsed.accessToken;
    }
    return null;
  };

  // Perform checkout
  const checkout = useCallback(
    async (reservationId: string, deviceInfo?: string) => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(
          `${API_BASE}/reservations/${reservationId}/checkout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              deviceInfo: deviceInfo || 'Web Browser',
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || `Checkout failed: ${response.statusText}`
          );
        }

        const data = await response.json();
        setResult(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get checkout duration
  const getCheckInDuration = useCallback(
    async (reservationId: string) => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(
          `${API_BASE}/reservations/${reservationId}/duration`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch duration: ${response.statusText}`
          );
        }

        const data = await response.json();
        return data.durationMinutes;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        throw new Error(message);
      }
    },
    []
  );

  return {
    checkout,
    getCheckInDuration,
    loading,
    error,
    result,
  };
};

export default useCheckout;
