import { ShoppingCart } from 'lucide-react';
import { HamburgerMenu } from './HamburgerMenu';

type HeaderProps = {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onAdminClick: () => void;
};

export function Header({
  cartCount,
  onCartClick,
  onLogoClick,
  isAuthenticated,
  isAdmin,
  onLoginClick,
  onLogoutClick,
  onAdminClick
}: HeaderProps) {
  return (
    <header className="card2 mb-6 overflow-visible">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <HamburgerMenu
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            onLoginClick={onLoginClick}
            onLogoutClick={onLogoutClick}
            onAdminClick={onAdminClick}
          />
          <button
            onClick={onLogoClick}
            className="hover:opacity-70 transition-opacity flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-md bg-zinc-900 text-white grid place-items-center font-black text-sm">
              VV
            </div>
            <div className="leading-tight text-left">
              <div className="text-base sm:text-lg font-extrabold tracking-tight">VintageVibes</div>
              <div className="muted text-xs uppercase tracking-wider">archív / utca / válogatott</div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block w-80">
            <input className="input" placeholder="Keresés márka, méret, cikkszám..." />
          </div>
          {!isAuthenticated ? (
            <button onClick={onLoginClick} className="btn-ghost">
              Belépés
            </button>
          ) : (
            <>
              {isAdmin && (
                <button onClick={onAdminClick} className="btn">
                  Admin
                </button>
              )}
              <button onClick={onLogoutClick} className="btn-ghost">
                Kilépés
              </button>
            </>
          )}
          <button onClick={onCartClick} className="btn relative">
            <ShoppingCart className="w-4 h-4" />
            Kosár
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-zinc-900">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
