import React, { useState } from 'react';
import { LogOut, Clock, AlertCircle } from 'lucide-react';

interface CheckoutButtonProps {
  reservationId: string;
  durationMinutes?: number;
  onCheckout: (reservationId: string) => Promise<void>;
  disabled?: boolean;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  reservationId,
  durationMinutes,
  onCheckout,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onCheckout(reservationId);
      setSuccess(true);
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {durationMinutes !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Current Duration</p>
            <p className="text-lg font-bold text-blue-600">
              {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm font-medium text-green-700">
            Successfully checked out!
          </p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={disabled || loading || success}
        className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
          disabled || loading || success
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
        }`}
      >
        <LogOut className="w-4 h-4" />
        {loading ? 'Checking Out...' : 'Check Out Now'}
      </button>
    </div>
  );
};

export default CheckoutButton;
