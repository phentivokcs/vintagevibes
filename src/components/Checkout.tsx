import { useState, useEffect } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { PacketaWidget, type PacketaPoint } from './PacketaWidget';

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
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
};

export function Checkout({ items, onClose, onComplete, onTermsClick, onPrivacyClick }: CheckoutProps) {
  const [step, setStep] = useState<'customer' | 'shipping' | 'billing' | 'payment'>('customer');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [barionLogo, setBarionLogo] = useState('/medium-nobg-light.png');
  const [paymentMethod, setPaymentMethod] = useState<'barion' | 'cash_on_delivery'>('barion');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'home' | 'packeta'>('home');
  const [packetaEnabled, setPacketaEnabled] = useState(false);
  const [packetaApiKey, setPacketaApiKey] = useState('');
  const [selectedPacketaPoint, setSelectedPacketaPoint] = useState<PacketaPoint | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

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

  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('barion_logo, packeta_enabled, packeta_api_key')
        .maybeSingle();

      if (!error && data) {
        if (data.barion_logo) setBarionLogo(data.barion_logo);
        if (data.packeta_enabled) {
          setPacketaEnabled(true);
          setPacketaApiKey(data.packeta_api_key || '');
        }
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Kérjük, fogadja el az Általános Szerződési Feltételeket és az Adatvédelmi Tájékoztatót!');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'barion') {
        const cartItems = items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
        }));

        const shippingInfo = {
          name: shipping.name,
          email: customer.email,
          phone: customer.phone,
          address: shipping.address,
          city: shipping.city,
          zip: shipping.postal_code,
          country: shipping.country,
        };

        const billingInfo = sameAsShipping ? shippingInfo : {
          name: billing.name,
          email: customer.email,
          phone: customer.phone,
          address: billing.address,
          city: billing.city,
          zip: billing.postal_code,
          country: billing.country,
        };

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barion-start-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              cartItems,
              shippingInfo,
              billingInfo,
              totalAmount: total,
              packetaPoint: shippingMethod === 'packeta' ? selectedPacketaPoint : null,
            }),
          }
        );

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Hiba történt a fizetés indításakor');
        }

        window.location.href = data.gatewayUrl;
      } else {
        onComplete({
          customer,
          shipping,
          billing: sameAsShipping ? shipping : billing,
          notes,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-start sm:items-center justify-center p-2 sm:p-4 py-8">
        <div className="w-full max-w-6xl">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="card2 p-4 sm:p-6 lg:col-span-2 space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Pénztár</h2>
              <p className="muted text-sm">Szállítás és fizetés</p>
            </div>
            {step === 'customer' && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold">Adataid</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="muted text-xs uppercase tracking-wider font-medium">Név *</span>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="input text-base"
                      placeholder="Neved"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="muted text-xs uppercase tracking-wider font-medium">Telefon *</span>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="input text-base"
                      placeholder="+36 30 123 4567"
                    />
                  </label>
                </div>
                <label className="space-y-1.5">
                  <span className="muted text-xs uppercase tracking-wider font-medium">E-mail *</span>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="input text-base"
                    placeholder="te@email.com"
                  />
                </label>
              </div>
            )}

            {step === 'shipping' && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold">Szállítási mód</h3>

                {packetaEnabled && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setShippingMethod('home')}
                      className={`card p-4 border-2 w-full text-left transition-all ${
                        shippingMethod === 'home'
                          ? 'border-amber-500/50 bg-gradient-to-br from-white to-amber-50/30'
                          : 'border-zinc-200 hover:border-amber-300'
                      }`}
                    >
                      <p className="text-sm font-bold mb-1">Házhozszállítás</p>
                      <p className="text-xs muted">Kiszállítjuk az ajtóig</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingMethod('packeta')}
                      className={`card p-4 border-2 w-full text-left transition-all ${
                        shippingMethod === 'packeta'
                          ? 'border-amber-500/50 bg-gradient-to-br from-white to-amber-50/30'
                          : 'border-zinc-200 hover:border-amber-300'
                      }`}
                    >
                      <p className="text-sm font-bold mb-1">Packeta csomagpont</p>
                      <p className="text-xs muted">Átvétel csomagpontban</p>
                    </button>
                  </div>
                )}

                {shippingMethod === 'packeta' ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold">Csomagpont kiválasztása</h3>
                    <PacketaWidget
                      apiKey={packetaApiKey}
                      onPointSelected={setSelectedPacketaPoint}
                      selectedPoint={selectedPacketaPoint}
                    />
                    <label className="space-y-1.5">
                      <span className="muted text-xs uppercase tracking-wider font-medium">Teljes név *</span>
                      <input
                        type="text"
                        required
                        value={shipping.name}
                        onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                        className="input text-base"
                        placeholder="Teljes név"
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-bold">Szállítási cím</h3>
                    <label className="space-y-1.5">
                      <span className="muted text-xs uppercase tracking-wider font-medium">Teljes név *</span>
                      <input
                        type="text"
                        required
                        value={shipping.name}
                        onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                        className="input text-base"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="muted text-xs uppercase tracking-wider font-medium">Cím *</span>
                      <input
                        type="text"
                        required
                        value={shipping.address}
                        onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                        className="input text-base"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="muted text-xs uppercase tracking-wider font-medium">Város *</span>
                        <input
                          type="text"
                          required
                          value={shipping.city}
                          onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                          className="input text-base"
                        />
                      </label>
                      <label className="space-y-1.5">
                        <span className="muted text-xs uppercase tracking-wider font-medium">Irányítószám *</span>
                        <input
                          type="text"
                          required
                          value={shipping.postal_code}
                          onChange={(e) => setShipping({ ...shipping, postal_code: e.target.value })}
                          className="input text-base"
                        />
                      </label>
                    </div>
                    <label className="space-y-1.5">
                      <span className="muted text-xs uppercase tracking-wider font-medium">Ország *</span>
                      <input
                        type="text"
                        required
                        value={shipping.country}
                        onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                        className="input text-base"
                      />
                    </label>
                  </>
                )}
              </div>
            )}

            {step === 'billing' && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold">Számlázási cím</h3>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-zinc-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">Megegyezik a szállítási címmel</span>
                </label>

                {!sameAsShipping && (
                  <>
                    <label className="space-y-1.5">
                      <span className="muted text-xs uppercase tracking-wider font-medium">Teljes név *</span>
                      <input
                        type="text"
                        required
                        value={billing.name}
                        onChange={(e) => setBilling({ ...billing, name: e.target.value })}
                        className="input text-base"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="muted text-xs uppercase tracking-wider font-medium">Cím *</span>
                      <input
                        type="text"
                        required
                        value={billing.address}
                        onChange={(e) => setBilling({ ...billing, address: e.target.value })}
                        className="input text-base"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="muted text-xs uppercase tracking-wider font-medium">Város *</span>
                        <input
                          type="text"
                          required
                          value={billing.city}
                          onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                          className="input text-base"
                        />
                      </label>
                      <label className="space-y-1.5">
                        <span className="muted text-xs uppercase tracking-wider font-medium">Irányítószám *</span>
                        <input
                          type="text"
                          required
                          value={billing.postal_code}
                          onChange={(e) => setBilling({ ...billing, postal_code: e.target.value })}
                          className="input text-base"
                        />
                      </label>
                    </div>
                    <label className="space-y-1.5">
                      <span className="muted text-xs uppercase tracking-wider font-medium">Ország *</span>
                      <input
                        type="text"
                        required
                        value={billing.country}
                        onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                        className="input text-base"
                      />
                    </label>
                  </>
                )}

                <label className="space-y-1.5">
                  <span className="muted text-xs uppercase tracking-wider font-medium">Megjegyzések (opcionális)</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="input text-base"
                    placeholder="Van valami speciális kérésed?"
                  />
                </label>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold">Fizetési mód</h3>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-bold text-gray-900">Elfogadás szükséges a vásárláshoz *</h4>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      Elolvastam és elfogadom az{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onTermsClick?.();
                        }}
                        className="text-amber-600 hover:text-amber-700 underline font-semibold"
                      >
                        Általános Szerződési Feltételeket
                      </button>
                      {' '}*
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      Elolvastam és elfogadom az{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onPrivacyClick?.();
                        }}
                        className="text-amber-600 hover:text-amber-700 underline font-semibold"
                      >
                        Adatvédelmi Tájékoztatót
                      </button>
                      , beleértve a Barion Pixel használatát is *
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('barion')}
                  className={`card p-6 border-2 w-full text-left transition-all ${
                    paymentMethod === 'barion'
                      ? 'border-amber-500/50 bg-gradient-to-br from-white to-amber-50/30'
                      : 'border-zinc-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <p className="text-lg font-bold">Fizetés Barionnal</p>
                    <img
                      src={barionLogo}
                      alt="Barion Payment"
                      className="h-10 sm:h-12 w-auto object-contain"
                    />
                  </div>
                  <p className="muted text-sm mb-3">Biztonságos online fizetés bankkártyával</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs muted">
                    <span>✓ Azonnali fizetés</span>
                    <span>•</span>
                    <span>✓ Biztonságos</span>
                    <span>•</span>
                    <span>✓ Bankkártya</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`card p-6 border-2 w-full text-left transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-amber-500/50 bg-gradient-to-br from-white to-amber-50/30'
                      : 'border-zinc-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold mb-1">Utánvét</p>
                      <p className="muted text-sm">Fizetés átvételkor készpénzzel</p>
                    </div>
                    <CreditCard className="w-10 h-10 text-zinc-400" />
                  </div>
                </button>

                <div className="flex items-center gap-2 text-xs muted pt-2">
                  <span>Fizetési szolgáltató:</span>
                  <img
                    src={barionLogo}
                    alt="Barion"
                    className="h-6 sm:h-7 w-auto object-contain"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {step !== 'customer' && (
                <button
                  type="button"
                  onClick={() => {
                    const steps: Array<'customer' | 'shipping' | 'billing' | 'payment'> = ['customer', 'shipping', 'billing', 'payment'];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
                  }}
                  className="btn w-full sm:flex-1 py-3 text-sm sm:text-base"
                >
                  Vissza
                </button>
              )}
              {step !== 'payment' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 'shipping' && shippingMethod === 'packeta' && !selectedPacketaPoint) {
                      setError('Kérjük válassz csomagpontot!');
                      return;
                    }
                    setError(null);
                    const steps: Array<'customer' | 'shipping' | 'billing' | 'payment'> = ['customer', 'shipping', 'billing', 'payment'];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
                  }}
                  className="btn-primary w-full sm:flex-1 py-3 text-sm sm:text-base"
                >
                  Tovább
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full sm:flex-1 py-3 text-sm sm:text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Feldolgozás...
                    </>
                  ) : (
                    'Rendelés leadása'
                  )}
                </button>
              )}
            </div>
          </div>

          <aside className="card2 p-4 sm:p-6 space-y-4 lg:sticky lg:top-4 lg:self-start">
            <h3 className="text-base font-extrabold">Összegzés</h3>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="muted truncate">{item.name} ×{item.quantity}</span>
                  <span className="font-medium whitespace-nowrap">{item.price * item.quantity} Ft</span>
                </div>
              ))}
              <div className="border-t border-zinc-200 pt-2 mt-2 flex justify-between font-bold">
                <span>Összesen</span>
                <span>{total} Ft</span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="btn w-full py-2.5">
              <X className="w-4 h-4" />
              Bezárás
            </button>
            <p className="muted text-xs text-center">Biztonságos fizetés</p>
          </aside>
          </form>
        </div>
      </div>
    </div>
  );
}
