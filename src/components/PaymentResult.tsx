import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type PaymentResultProps = {
  onClose: () => void;
};

export function PaymentResult({ onClose }: PaymentResultProps) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'failed' | 'cancelled' | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('paymentId');

      if (!paymentId) {
        setStatus('failed');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barion-callback?paymentId=${paymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setOrderId(data.orderId);

          if (data.paymentStatus === 'succeeded') {
            setStatus('success');
          } else if (data.paymentStatus === 'cancelled') {
            setStatus('cancelled');
          } else {
            setStatus('failed');
          }
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="card2 p-8 max-w-md w-full text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-amber-600 mx-auto" />
          <h2 className="text-xl font-bold">Fizetés ellenőrzése...</h2>
          <p className="muted">Kérlek várj, amíg megerősítjük a fizetésedet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card2 p-8 max-w-md w-full text-center space-y-6">
        {status === 'success' && (
          <>
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-600">Sikeres fizetés!</h2>
              <p className="text-lg">Köszönjük a rendelésedet</p>
              {orderId && (
                <p className="muted text-sm">Rendelésazonosító: {orderId.slice(0, 8)}</p>
              )}
            </div>
            <p className="muted">
              Hamarosan e-mailt küldünk a rendelésed részleteivel és a szállítási információkkal.
            </p>
            <button
              onClick={onClose}
              className="btn-primary w-full py-3"
            >
              Vissza a főoldalra
            </button>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <XCircle className="w-20 h-20 text-amber-600 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Fizetés megszakítva</h2>
              <p className="muted">A fizetési folyamatot megszakítottad.</p>
            </div>
            <p className="text-sm muted">
              A termékek visszakerültek a kosaramba. Ha szeretnéd, újra megpróbálhatod a fizetést.
            </p>
            <button
              onClick={onClose}
              className="btn-primary w-full py-3"
            >
              Vissza a kosárhoz
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-20 h-20 text-red-600 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-red-600">Sikertelen fizetés</h2>
              <p className="muted">Hiba történt a fizetés során.</p>
            </div>
            <p className="text-sm muted">
              Kérlek, próbáld újra, vagy válassz másik fizetési módot. Ha a probléma továbbra is fennáll, lépj kapcsolatba velünk.
            </p>
            <button
              onClick={onClose}
              className="btn-primary w-full py-3"
            >
              Vissza a kosárhoz
            </button>
          </>
        )}
      </div>
    </div>
  );
}
