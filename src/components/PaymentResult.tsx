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
      const paymentStatus = urlParams.get('status');
      const orderIdParam = urlParams.get('orderId');
      const paymentId = urlParams.get('paymentId');

      // If we have paymentId but no status, fetch from database
      if (paymentId && !paymentStatus) {
        try {
          const { data: order, error } = await supabase
            .from('orders')
            .select('id, payment_status')
            .eq('payment_id', paymentId)
            .maybeSingle();

          if (error || !order) {
            setStatus('failed');
            setLoading(false);
            return;
          }

          setOrderId(order.id);

          if (order.payment_status === 'succeeded') {
            setStatus('success');
          } else if (order.payment_status === 'cancelled') {
            setStatus('cancelled');
          } else if (order.payment_status === 'expired' || order.payment_status === 'failed') {
            setStatus('failed');
          } else {
            // Still processing
            setStatus('failed');
          }
        } catch (error) {
          console.error('Error fetching payment status:', error);
          setStatus('failed');
        }
        setLoading(false);
        return;
      }

      if (!paymentStatus) {
        setStatus('failed');
        setLoading(false);
        return;
      }

      if (orderIdParam) {
        setOrderId(orderIdParam);
      }

      if (paymentStatus === 'succeeded') {
        setStatus('success');
      } else if (paymentStatus === 'cancelled') {
        setStatus('cancelled');
      } else if (paymentStatus === 'expired') {
        setStatus('failed');
      } else if (paymentStatus === 'failed' || paymentStatus === 'error') {
        setStatus('failed');
      } else {
        setStatus('failed');
      }

      setLoading(false);
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
