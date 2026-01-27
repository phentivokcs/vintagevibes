import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, ChevronRight, ChevronDown, LogIn, LogOut, Shield } from 'lucide-react';

const categories = {
  men: {
    title: 'Férfi',
    items: ['Póló', 'Pulcsi', 'Rövidnadrág', 'Melegítőnadrág', 'Farmerek', 'Sapkák', 'Kabátok', 'Kiegészítők']
  },
  women: {
    title: 'Női',
    items: ['Póló', 'Pulcsi', 'Rövidnadrág', 'Melegítőnadrág', 'Farmerek', 'Sapkák', 'Kabátok', 'Kiegészítők']
  }
};

const specialCategories = ['Akciós', 'Gyűjtői darabok', 'Szettek'];

type HamburgerMenuProps = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onAdminClick: () => void;
  onCategoryClick?: (gender: string, category: string) => void;
};

export function HamburgerMenu({
  isAuthenticated,
  isAdmin,
  onLoginClick,
  onLogoutClick,
  onAdminClick,
  onCategoryClick
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost p-2"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[60]"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed top-0 left-0 h-full w-80 bg-zinc-100 shadow-2xl z-[70] overflow-y-auto">
            <div className="card2 m-4 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold tracking-tight">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <button
                    onClick={() => toggleCategory('men')}
                    className="w-full flex items-center justify-between p-3 hover:bg-zinc-900/5 rounded-md transition text-left"
                  >
                    <span className="text-zinc-900 font-semibold tracking-wide">
                      {categories.men.title}
                    </span>
                    {expandedCategory === 'men' ? (
                      <ChevronDown className="w-5 h-5 text-zinc-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-zinc-600" />
                    )}
                  </button>

                  {expandedCategory === 'men' && (
                    <div className="ml-4 mt-2 space-y-1">
                      {categories.men.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            onCategoryClick?.('Férfi', item);
                            setIsOpen(false);
                          }}
                          className="block w-full text-left p-2 text-zinc-700 hover:text-zinc-900 hover:bg-amber-50 rounded-md transition text-sm"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => toggleCategory('women')}
                    className="w-full flex items-center justify-between p-3 hover:bg-zinc-900/5 rounded-md transition text-left"
                  >
                    <span className="text-zinc-900 font-semibold tracking-wide">
                      {categories.women.title}
                    </span>
                    {expandedCategory === 'women' ? (
                      <ChevronDown className="w-5 h-5 text-zinc-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-zinc-600" />
                    )}
                  </button>

                  {expandedCategory === 'women' && (
                    <div className="ml-4 mt-2 space-y-1">
                      {categories.women.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            onCategoryClick?.('Női', item);
                            setIsOpen(false);
                          }}
                          className="block w-full text-left p-2 text-zinc-700 hover:text-zinc-900 hover:bg-amber-50 rounded-md transition text-sm"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-200 space-y-1">
                  {specialCategories.map((category) => (
                    <button
                      key={category}
                      className="w-full text-left p-3 text-zinc-900 font-semibold tracking-wide hover:bg-zinc-900/5 rounded-md transition"
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-zinc-200 space-y-1">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        onLoginClick();
                        setIsOpen(false);
                      }}
                      className="w-full text-left p-3 text-zinc-900 font-semibold tracking-wide hover:bg-amber-50 rounded-md transition flex items-center gap-2"
                    >
                      <LogIn className="w-5 h-5" />
                      Belépés
                    </button>
                  ) : (
                    <>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            onAdminClick();
                            setIsOpen(false);
                          }}
                          className="w-full text-left p-3 text-amber-700 font-semibold tracking-wide hover:bg-amber-50 rounded-md transition flex items-center gap-2"
                        >
                          <Shield className="w-5 h-5" />
                          Admin
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onLogoutClick();
                          setIsOpen(false);
                        }}
                        className="w-full text-left p-3 text-zinc-900 font-semibold tracking-wide hover:bg-zinc-900/5 rounded-md transition flex items-center gap-2"
                      >
                        <LogOut className="w-5 h-5" />
                        Kilépés
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
