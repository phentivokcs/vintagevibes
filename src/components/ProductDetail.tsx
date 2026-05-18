import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../lib/supabase';
import { LazyImage } from './LazyImage';

type ProductDetailProps = {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
};

export function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200'];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isAvailable = product.inventory_status === 'available' && !product.sold && product.stock > 0;
  const isReserved = product.inventory_status === 'reserved';
  const isSold = product.sold || product.inventory_status === 'sold' || product.stock === 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    onClose();
  };

  const getStockStatus = () => {
    if (isSold) return { text: 'Elfogyott', color: 'text-red-600 bg-red-50 border-red-200' };
    if (isReserved) return { text: 'Lefoglalva', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { text: 'Raktáron', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative w-full md:w-1/2 bg-zinc-100 flex items-center justify-center min-h-[300px] md:min-h-0">
          <LazyImage
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
            placeholderClassName="w-full h-full"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-3 py-1 text-xs font-semibold text-zinc-600 bg-zinc-100 rounded-full mb-3">
                  {product.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  {product.name}
                </h2>
              </div>
              <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-black text-zinc-900">
                {product.price.toLocaleString('hu-HU')} Ft
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-700">Méret:</span>
                  <span className="px-3 py-1 bg-zinc-100 rounded-md font-medium">
                    {product.size}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-700">Állapot:</span>
                  <span className="text-zinc-600">{product.condition}</span>
                </div>
              </div>

              {product.description && (
                <div className="pt-4 border-t border-zinc-200">
                  <h3 className="text-sm font-bold text-zinc-700 mb-2">Leírás</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {isAvailable && (
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Kosárba rakom
            </button>
          )}

          {!isAvailable && (
            <div className="w-full py-4 bg-zinc-200 text-zinc-500 font-bold rounded-xl text-center cursor-not-allowed">
              {isSold ? 'Ez a termék már nem elérhető' : 'Ez a termék jelenleg foglalt'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
