import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onShippingClick: () => void;
  footerLogoUrl?: string;
}

export default function Footer({ onPrivacyClick, onTermsClick, onShippingClick, footerLogoUrl }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-md bg-white text-gray-900 grid place-items-center font-black text-sm">
                VV
              </div>
              <div className="leading-tight">
                <div className="text-lg font-extrabold tracking-tight text-white">VintageVibes</div>
                <div className="text-xs uppercase tracking-wider text-gray-400">vintage wear</div>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Egyedi vintage ruházat szerelmeseinek. Minden darab egy történet.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Jogi információk</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={onPrivacyClick}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Adatvédelmi Tájékoztató
                </button>
              </li>
              <li>
                <button
                  onClick={onTermsClick}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  ÁSZF
                </button>
              </li>
              <li>
                <button
                  onClick={onShippingClick}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Szállítás és Visszaküldés
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Vásárlói tájékoztató</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  GYIK
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Mérettáblázat
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Ápolási útmutató
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Rólunk
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Kapcsolat</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:vintagevibeshungary@gmail.com" className="hover:text-amber-400 transition-colors">
                  vintagevibeshungary@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>8446 Kislőd, Bocskay utca 14.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              {currentYear} VintageVibes. Minden jog fenntartva.
            </p>
            {footerLogoUrl && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Fizetés biztosítja:</span>
                <img
                  src={footerLogoUrl}
                  alt="Barion Payment"
                  className="h-8 object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
