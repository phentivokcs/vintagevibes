import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { ProductCard } from './ProductCard';

type NewArrivalsProps = {
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
};

export function NewArrivals({ onClose, onAddToCart, onProductClick }: NewArrivalsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewProducts();
  }, []);

  const loadNewProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('inventory_status', 'available')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-7xl">
          <div className="card2 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Új Érkezések</h2>
                  <p className="muted text-sm">Frissen beérkezett vintage darabok</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="btn w-10 h-10 rounded-full p-0 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="muted">Termékek betöltése...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                <p className="muted text-lg">Jelenleg nincsenek új termékek</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm muted">
                      <span className="font-bold text-amber-600">{products.length}</span> friss termék
                    </p>
                    <div className="flex items-center gap-2 text-xs muted">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span>Most érkezett</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onProductClick={onProductClick}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
