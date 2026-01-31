import { ShoppingCart } from 'lucide-react';
import type { Product } from '../lib/supabase';
import { LazyImage } from './LazyImage';

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
};

export function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800';

  const isAvailable = product.inventory_status === 'available' && !product.sold && product.stock > 0;
  const isReserved = product.inventory_status === 'reserved';
  const isSold = product.sold || product.inventory_status === 'sold' || product.stock === 0;

  return (
    <article
      className="group overflow-hidden rounded-lg border border-zinc-200/80 bg-white/70 shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-[4/5] bg-zinc-200/40 overflow-hidden">
        <LazyImage
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          placeholderClassName="aspect-[4/5]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/35 via-transparent to-transparent opacity-70" />

        {isSold && (
          <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-wider uppercase">
              Elfogyott
            </span>
          </div>
        )}
        {isReserved && (
          <div className="absolute inset-0 bg-amber-600/80 flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-wider uppercase">
              Lefoglalva
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-md bg-white/80 backdrop-blur px-2 py-1 text-xs font-bold text-zinc-900 border border-white/60">
          {product.price} Ft
        </div>

        {isAvailable && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 transition duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="btn-primary w-full"
            >
              Kosárba
            </button>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-tight line-clamp-2">{product.name}</h3>
          <span className="tag">{product.size}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="muted">{product.category}</span>
          <span className="text-zinc-500">{product.condition}</span>
        </div>
      </div>
    </article>
  );
}
