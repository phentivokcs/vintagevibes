import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-6 shadow-2xl z-50 border-t-4 border-amber-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">Sütikezelési Tájékoztató</h3>
          <p className="text-sm text-gray-300">
            Weboldalunk sütiket (cookie-kat) használ a jobb felhasználói élmény biztosítása érdekében.
            A sütik segítenek a weboldal megfelelő működésében, a tartalom személyre szabásában és a
            látogatottság elemzésében. A weboldal használatával Ön hozzájárul a sütik használatához.
            {' '}
            <a href="/privacy-policy" className="text-amber-400 hover:text-amber-300 underline">
              Részletek az Adatvédelmi Tájékoztatóban
            </a>
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={rejectCookies}
            className="px-4 py-2 text-sm border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
          >
            Elutasítom
          </button>
          <button
            onClick={acceptCookies}
            className="px-6 py-2 text-sm bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors font-semibold"
          >
            Elfogadom
          </button>
          <button
            onClick={rejectCookies}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Bezárás"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
