import { ProductCard } from './ProductCard';
import type { Product } from '../lib/supabase';

type ProductGridProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  selectedCategory?: { gender: string; category: string } | null;
  loading?: boolean;
};

function ProductSkeleton() {
  return (
    <div className="group overflow-hidden rounded-lg border border-zinc-200/80 bg-white/70 shadow-sm">
      <div className="relative aspect-[4/5] bg-gradient-to-br from-zinc-100 to-zinc-200 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-zinc-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-zinc-200 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, onAddToCart, onProductClick, selectedCategory, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <section className="mt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

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

  if (selectedCategory) {
    const filteredProducts = products.filter(
      (product) =>
        (product.gender || 'Férfi') === selectedCategory.gender &&
        product.category === selectedCategory.category
    );

    if (filteredProducts.length === 0) {
      return (
        <div className="card2 p-12 text-center">
          <p className="text-2xl font-black tracking-tight">
            Nincs termék ebben a kategóriában
          </p>
          <p className="muted text-lg mt-4">
            {selectedCategory.gender} - {selectedCategory.category}
          </p>
        </div>
      );
    }

    return (
      <section className="mt-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {selectedCategory.gender} - {selectedCategory.category}
            </h2>
            <p className="muted text-sm">
              {filteredProducts.length} termék
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onClick={onProductClick}
            />
          ))}
        </div>
      </section>
    );
  }

  const groupedProducts: Record<string, Record<string, Product[]>> = {};

  products.forEach((product) => {
    const gender = product.gender || 'Férfi';
    const category = product.category;

    if (!groupedProducts[gender]) {
      groupedProducts[gender] = {};
    }

    if (!groupedProducts[gender][category]) {
      groupedProducts[gender][category] = [];
    }

    groupedProducts[gender][category].push(product);
  });

  const genders = ['Férfi', 'Női'];
  const sections = genders.flatMap((gender) => {
    if (!groupedProducts[gender]) return [];

    return Object.keys(groupedProducts[gender]).map((category) => ({
      gender,
      category,
      products: groupedProducts[gender][category],
    }));
  });

  return (
    <section className="mt-6 space-y-12">
      {sections.map(({ gender, category, products }) => {
        const sectionId = `${gender.toLowerCase()}-${category.toLowerCase().replace(/\s+/g, '-')}`;

        return (
          <div key={`${gender}-${category}`} id={sectionId} className="space-y-4 scroll-mt-24">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {gender} - {category}
                </h2>
                <p className="muted text-sm">
                  {products.length} termék
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onClick={onProductClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
