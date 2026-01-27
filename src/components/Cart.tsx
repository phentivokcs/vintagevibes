import { X, Trash2 } from 'lucide-react';
import type { Product } from '../lib/supabase';

type CartItem = Product & { quantity: number };

type CartProps = {
  items: CartItem[];
  onClose: () => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
};

export function Cart({ items, onClose, onRemoveItem, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-start justify-end">
      <div className="bg-zinc-100 w-full max-w-md h-full shadow-2xl overflow-y-auto">
        <div className="card2 p-4 sm:p-6 space-y-4 m-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Kosár</h2>
            {items.length > 0 && <span className="tag">{items.length} termék</span>}
          </div>

          {items.length === 0 ? (
            <div className="card2 p-12 text-center">
              <p className="text-xl font-bold tracking-tight">A kosarad üres</p>
              <p className="muted text-sm mt-2">Kezdj el nézelődni a vintage darabok között</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="card p-3">
                    <div className="flex gap-3">
                      <img
                        src={
                          item.images && item.images.length > 0
                            ? item.images[0]
                            : 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=200'
                        }
                        alt={item.name}
                        className="h-20 w-16 rounded-md object-cover bg-zinc-200/40"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{item.name}</div>
                            <div className="muted text-xs">{item.size} · {item.category}</div>
                          </div>
                          <div className="text-sm font-semibold whitespace-nowrap">{item.price} Ft</div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs muted">Egyedi darab</span>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="btn-ghost"
                          >
                            Törlés
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                <span className="muted text-sm">Összesen</span>
                <span className="text-base font-extrabold">{total} Ft</span>
              </div>

              <button onClick={onCheckout} className="btn-primary w-full py-3">
                Pénztár
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="btn w-full"
          >
            <X className="w-4 h-4" />
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
