import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import type { Product } from '../lib/supabase';

type CartItem = Product & { quantity: number };

type CheckoutProps = {
  items: CartItem[];
  onClose: () => void;
  onComplete: (orderData: {
    customer: { name: string; email: string; phone: string };
    shipping: {
      name: string;
      address: string;
      city: string;
      postal_code: string;
      country: string;
    };
    billing: {
      name: string;
      address: string;
      city: string;
      postal_code: string;
      country: string;
    };
    notes: string;
  }) => void;
};

export function Checkout({ items, onClose, onComplete }: CheckoutProps) {
  const [step, setStep] = useState<'customer' | 'shipping' | 'billing' | 'payment'>('customer');
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [shipping, setShipping] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Hungary',
  });

  const [billing, setBilling] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Hungary',
  });

  const [notes, setNotes] = useState('');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      customer,
      shipping,
      billing: sameAsShipping ? shipping : billing,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="container-x my-8">
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="card2 p-4 sm:p-6 lg:col-span-2 space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Pénztár</h2>
              <p className="muted text-sm">Szállítás és fizetés</p>
            </div>
            {step === 'customer' && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold">Adataid</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1">
                    <span className="muted text-xs uppercase tracking-wider">Név *</span>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="input"
                      placeholder="Neved"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="muted text-xs uppercase tracking-wider">Telefon *</span>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="input"
                      placeholder="+36 30 123 4567"
                    />
                  </label>
                </div>
                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">E-mail *</span>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="input"
                    placeholder="te@email.com"
                  />
                </label>
              </div>
            )}

            {step === 'shipping' && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold">Szállítási cím</h3>
                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Teljes név *</span>
                  <input
                    type="text"
                    required
                    value={shipping.name}
                    onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                    className="input"
                  />
                </label>
                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Cím *</span>
                  <input
                    type="text"
                    required
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className="input"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1 sm:col-span-2">
                    <span className="muted text-xs uppercase tracking-wider">Város *</span>
                    <input
                      type="text"
                      required
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="input"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="muted text-xs uppercase tracking-wider">Irányítószám *</span>
                    <input
                      type="text"
                      required
                      value={shipping.postal_code}
                      onChange={(e) => setShipping({ ...shipping, postal_code: e.target.value })}
                      className="input"
                    />
                  </label>
                </div>
                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Ország *</span>
                  <input
                    type="text"
                    required
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    className="input"
                  />
                </label>
              </div>
            )}

            {step === 'billing' && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold">Számlázási cím</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Megegyezik a szállítási címmel</span>
                </label>

                {!sameAsShipping && (
                  <>
                    <label className="space-y-1">
                      <span className="muted text-xs uppercase tracking-wider">Teljes név *</span>
                      <input
                        type="text"
                        required
                        value={billing.name}
                        onChange={(e) => setBilling({ ...billing, name: e.target.value })}
                        className="input"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="muted text-xs uppercase tracking-wider">Cím *</span>
                      <input
                        type="text"
                        required
                        value={billing.address}
                        onChange={(e) => setBilling({ ...billing, address: e.target.value })}
                        className="input"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="space-y-1 sm:col-span-2">
                        <span className="muted text-xs uppercase tracking-wider">Város *</span>
                        <input
                          type="text"
                          required
                          value={billing.city}
                          onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                          className="input"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Irányítószám *</span>
                        <input
                          type="text"
                          required
                          value={billing.postal_code}
                          onChange={(e) => setBilling({ ...billing, postal_code: e.target.value })}
                          className="input"
                        />
                      </label>
                    </div>
                    <label className="space-y-1">
                      <span className="muted text-xs uppercase tracking-wider">Ország *</span>
                      <input
                        type="text"
                        required
                        value={billing.country}
                        onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                        className="input"
                      />
                    </label>
                  </>
                )}

                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Megjegyzések (opcionális)</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="input"
                    placeholder="Van valami speciális kérésed?"
                  />
                </label>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold">Fizetés</h3>
                <div className="card p-8 text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-white/40" />
                  <p className="text-lg font-bold mb-2">Utánvét</p>
                  <p className="muted text-sm">Fizetés átvételkor</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step !== 'customer' && (
                <button
                  type="button"
                  onClick={() => {
                    const steps: Array<'customer' | 'shipping' | 'billing' | 'payment'> = ['customer', 'shipping', 'billing', 'payment'];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
                  }}
                  className="btn flex-1 py-3"
                >
                  Vissza
                </button>
              )}
              {step !== 'payment' ? (
                <button
                  type="button"
                  onClick={() => {
                    const steps: Array<'customer' | 'shipping' | 'billing' | 'payment'> = ['customer', 'shipping', 'billing', 'payment'];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
                  }}
                  className="btn-primary flex-1 py-3"
                >
                  Tovább
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3"
                >
                  Rendelés leadása
                </button>
              )}
            </div>
          </div>

          <aside className="card2 p-4 sm:p-6 space-y-4">
            <h3 className="text-base font-extrabold">Összegzés</h3>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="muted">{item.name} ×{item.quantity}</span>
                  <span>{item.price * item.quantity} Ft</span>
                </div>
              ))}
              <div className="border-t border-zinc-200 pt-2 mt-2 flex justify-between font-bold">
                <span>Összesen</span>
                <span>{total} Ft</span>
              </div>
            </div>
            <button onClick={onClose} className="btn w-full">
              <X className="w-4 h-4" />
              Bezárás
            </button>
            <p className="muted text-xs">Biztonságos fizetés</p>
          </aside>
        </form>
      </div>
    </div>
  );
}
