import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

declare global {
  interface Window {
    Packeta?: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaPoint | null) => void,
          options?: PacketaWidgetOptions
        ) => void;
      };
    };
  }
}

export type PacketaPoint = {
  id: string;
  name: string;
  place?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  address?: string;
};

type PacketaWidgetOptions = {
  country?: string;
  language?: string;
  appIdentity?: string;
};

type PacketaWidgetProps = {
  apiKey: string;
  onPointSelected: (point: PacketaPoint) => void;
  selectedPoint?: PacketaPoint | null;
  disabled?: boolean;
};

export function PacketaWidget({ apiKey, onPointSelected, selectedPoint, disabled }: PacketaWidgetProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setError('Nincs API kulcs');
      return;
    }

    let attempts = 0;
    const maxAttempts = 50;

    const checkPacketa = () => {
      attempts++;
      if (window.Packeta) {
        console.log('Packeta widget loaded successfully');
        setScriptLoaded(true);
        setError(null);
      } else if (attempts < maxAttempts) {
        setTimeout(checkPacketa, 100);
      } else {
        setError('Packeta widget nem töltődött be. Ellenőrizd a böngésző konzolt és az ad blockereket.');
        console.error('Packeta widget failed to load after', maxAttempts * 100, 'ms');
      }
    };

    checkPacketa();

    // Cleanup: remove styles if component unmounts
    return () => {
      document.body.classList.remove('packeta-open');
      const styleEl = document.getElementById('packeta-custom-style');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, [apiKey]);

  const handleOpenWidget = () => {
    if (!window.Packeta) {
      setError('Packeta widget még nem elérhető');
      return;
    }

    if (disabled) return;

    try {
      console.log('Opening Packeta widget with API key:', apiKey);

      // Add global style override that applies to iframe wherever it is
      const style = document.createElement('style');
      style.id = 'packeta-custom-style';
      style.textContent = `
        iframe[id="packeta-widget"],
        iframe[src*="widget.packeta"] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 90vw !important;
          max-width: 1200px !important;
          height: 85vh !important;
          max-height: 800px !important;
          min-height: 500px !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9) !important;
          z-index: 2147483647 !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        body.packeta-open {
          overflow: hidden !important;
        }
        body.packeta-open::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 2147483646;
          pointer-events: auto;
        }
      `;
      document.head.appendChild(style);

      // Add class to body for overlay
      document.body.classList.add('packeta-open');

      const cleanup = () => {
        document.body.classList.remove('packeta-open');
        const styleEl = document.getElementById('packeta-custom-style');
        if (styleEl) {
          styleEl.remove();
        }
      };

      // Close on background click
      const handleBackgroundClick = (e: MouseEvent) => {
        const iframe = document.getElementById('packeta-widget') as HTMLIFrameElement;
        if (iframe && !iframe.contains(e.target as Node)) {
          cleanup();
          document.removeEventListener('click', handleBackgroundClick);
        }
      };

      setTimeout(() => {
        document.addEventListener('click', handleBackgroundClick);
      }, 500);

      window.Packeta.Widget.pick(
        apiKey,
        (point: PacketaPoint | null) => {
          console.log('Packeta callback:', point);
          cleanup();
          document.removeEventListener('click', handleBackgroundClick);

          if (point) {
            onPointSelected(point);
          }
        },
        {
          country: 'hu',
          language: 'hu',
          appIdentity: 'vintage-shop',
        }
      );

    } catch (err) {
      console.error('Error opening Packeta widget:', err);
      document.body.classList.remove('packeta-open');
      const styleEl = document.getElementById('packeta-custom-style');
      if (styleEl) {
        styleEl.remove();
      }
      setError('Hiba a widget megnyitásakor: ' + (err instanceof Error ? err.message : 'Ismeretlen hiba'));
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleOpenWidget}
        disabled={!scriptLoaded || disabled}
        className="btn w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MapPin className="w-4 h-4" />
        {selectedPoint ? 'Csomagpont módosítása' : 'Csomagpont választása'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-xs">
          {error}
        </div>
      )}

      {selectedPoint && (
        <div className="card p-4 bg-gradient-to-br from-white to-green-50/30 border-2 border-green-500/30">
          <p className="text-sm font-bold mb-1">{selectedPoint.name}</p>
          <p className="text-xs muted">
            {selectedPoint.city && `${selectedPoint.city}, `}
            {selectedPoint.street || selectedPoint.address}
          </p>
        </div>
      )}

      {!scriptLoaded && !error && (
        <p className="text-xs muted text-center">Packeta widget betöltése...</p>
      )}
    </div>
  );
}
