import { ProductCard } from './ProductCard';
import type { Product } from '../lib/supabase';

type ProductGridProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
};

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="card2 p-12 text-center">
        <p className="text-2xl font-black tracking-tight">
          Még nincsenek termékek
        </p>
        <p className="muted text-lg mt-4">Hamarosan érkeznek a válogatott vintage darabok</p>
      </div>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Újdonságok</h2>
          <p className="muted text-sm">Meleg vintage hangulat, letisztult stílus.</p>
        </div>

        <div className="flex gap-2">
          <button className="btn">Szűrés</button>
          <button className="btn">Rendezés</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
