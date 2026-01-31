import { useState, useEffect } from 'react';
import { X, Plus, Package, ShoppingBag, Palette, Edit2, Trash2 } from 'lucide-react';
import { supabase, type Product, type Order } from '../lib/supabase';
import { ImageUpload } from './ImageUpload';
import { SiteSettings } from './SiteSettings';
import OrderManagement from './OrderManagement';
import { showToast } from './Toast';

type AdminPanelProps = {
  onClose: () => void;
  onProductAdded: () => void;
};

const CATEGORIES = [
  'Póló',
  'Pulcsi',
  'Rövidnadrág',
  'Melegítőnadrág',
  'Farmerek',
  'Sapkák',
  'Kabátok',
  'Kiegészítők'
] as const;

const GENDERS = ['Férfi', 'Női'] as const;

export function AdminPanel({ onClose, onProductAdded }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'design'>('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    size: '',
    condition: 'Good',
    category: 'Póló',
    gender: 'Férfi' as 'Férfi' | 'Női',
    images: [] as string[],
    stock: '1',
  });

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'design') {
      loadSiteSettings();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('error', 'Hiba történt a termékek betöltésekor');
    }
  };

  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
      showToast('error', 'Hiba történt a beállítások betöltésekor');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('products').insert({
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        size: newProduct.size,
        condition: newProduct.condition,
        category: newProduct.category,
        gender: newProduct.gender,
        images: newProduct.images,
        stock: parseInt(newProduct.stock),
        sold: false,
      });

      if (error) throw error;

      setNewProduct({
        name: '',
        description: '',
        price: '',
        size: '',
        condition: 'Good',
        category: 'Póló',
        gender: 'Férfi',
        images: [],
        stock: '1',
      });
      setShowAddProduct(false);
      loadProducts();
      onProductAdded();
      showToast('success', 'Termék sikeresen hozzáadva!');
    } catch (error) {
      console.error('Error adding product:', error);
      showToast('error', 'Hiba történt a termék hozzáadásakor');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          size: editingProduct.size,
          condition: editingProduct.condition,
          category: editingProduct.category,
          gender: editingProduct.gender,
          images: editingProduct.images,
          stock: editingProduct.stock,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      setEditingProduct(null);
      loadProducts();
      onProductAdded();
      showToast('success', 'Termék sikeresen frissítve!');
    } catch (error) {
      console.error('Error editing product:', error);
      showToast('error', 'Hiba történt a termék frissítésekor');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a terméket?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      loadProducts();
      onProductAdded();
      showToast('success', 'Termék sikeresen törölve!');
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('error', 'Hiba történt a termék törlésekor');
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="container-x my-8 max-h-[90vh] flex flex-col">
        <div className="space-y-4">
          <div className="card2 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Admin</h2>
                <p className="muted text-sm">Termékek • rendelések • dizájn</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`btn ${activeTab === 'products' ? 'btn-primary' : ''}`}
                >
                  <Package className="w-4 h-4" />
                  Termékek
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`btn ${activeTab === 'orders' ? 'btn-primary' : ''}`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Rendelések
                </button>
                <button
                  onClick={() => setActiveTab('design')}
                  className={`btn ${activeTab === 'design' ? 'btn-primary' : ''}`}
                >
                  <Palette className="w-4 h-4" />
                  Dizájn
                </button>
                <button onClick={onClose} className="btn">
                  <X className="w-4 h-4" />
                  Bezárás
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'products' && (
            <div className="space-y-4">
              {!showAddProduct && !editingProduct && (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="btn-primary w-full py-4"
                >
                  <Plus className="w-4 h-4" />
                  Új termék
                </button>
              )}

              {showAddProduct && (
                <div className="card2 p-4 sm:p-6">
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <h3 className="text-base font-extrabold mb-4">Új termék</h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Termék neve *</span>
                        <input
                          type="text"
                          required
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="input"
                          placeholder="Vintage farmer kabát"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Kategória *</span>
                        <select
                          required
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="input"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Nem *</span>
                        <select
                          required
                          value={newProduct.gender}
                          onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value as 'Férfi' | 'Női' })}
                          className="input"
                        >
                          {GENDERS.map((gender) => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="space-y-1">
                      <span className="muted text-xs uppercase tracking-wider">Leírás *</span>
                      <textarea
                        required
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows={3}
                        className="input"
                        placeholder="Csodálatos vintage darab a 90-es évekből..."
                      />
                    </label>

                    <div className="grid gap-3 grid-cols-3">
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Ár (Ft) *</span>
                        <input
                          type="number"
                          required
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="input"
                          placeholder="15000"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Méret *</span>
                        <input
                          type="text"
                          required
                          value={newProduct.size}
                          onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                          className="input"
                          placeholder="M, L, XL..."
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Készlet *</span>
                        <input
                          type="number"
                          required
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          className="input"
                          placeholder="1"
                        />
                      </label>
                    </div>

                    <label className="space-y-1">
                      <span className="muted text-xs uppercase tracking-wider">Állapot *</span>
                      <select
                        required
                        value={newProduct.condition}
                        onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })}
                        className="input"
                      >
                        <option value="Kiváló">Kiváló</option>
                        <option value="Jó">Jó</option>
                        <option value="Megfelelő">Megfelelő</option>
                      </select>
                    </label>

                    <div>
                      <label className="muted text-xs uppercase tracking-wider block mb-2">Termék képek</label>
                      <ImageUpload
                        existingImages={newProduct.images}
                        onImagesUploaded={(urls) => setNewProduct({ ...newProduct, images: urls })}
                      />
                      <p className="muted text-xs mt-2">Az első kép lesz a borítókép</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddProduct(false)}
                        className="btn flex-1 py-3"
                      >
                        Mégse
                      </button>
                      <button
                        type="submit"
                        className="btn-primary flex-1 py-3"
                      >
                        Termék hozzáadása
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {editingProduct && (
                <div className="card2 p-4 sm:p-6">
                  <form onSubmit={handleEditProduct} className="space-y-4">
                    <h3 className="text-base font-extrabold mb-4">Termék szerkesztése</h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Termék neve *</span>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="input"
                          placeholder="Vintage farmer kabát"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Kategória *</span>
                        <select
                          required
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="input"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Nem *</span>
                        <select
                          required
                          value={editingProduct.gender}
                          onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value as 'Férfi' | 'Női' })}
                          className="input"
                        >
                          {GENDERS.map((gender) => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="space-y-1">
                      <span className="muted text-xs uppercase tracking-wider">Leírás *</span>
                      <textarea
                        required
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        rows={3}
                        className="input"
                        placeholder="Csodálatos vintage darab a 90-es évekből..."
                      />
                    </label>

                    <div className="grid gap-3 grid-cols-3">
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Ár (Ft) *</span>
                        <input
                          type="number"
                          required
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                          className="input"
                          placeholder="15000"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Méret *</span>
                        <input
                          type="text"
                          required
                          value={editingProduct.size || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                          className="input"
                          placeholder="M, L, XL..."
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="muted text-xs uppercase tracking-wider">Készlet *</span>
                        <input
                          type="number"
                          required
                          value={editingProduct.stock}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                          className="input"
                          placeholder="1"
                        />
                      </label>
                    </div>

                    <label className="space-y-1">
                      <span className="muted text-xs uppercase tracking-wider">Állapot *</span>
                      <select
                        required
                        value={editingProduct.condition || 'Jó'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, condition: e.target.value })}
                        className="input"
                      >
                        <option value="Kiváló">Kiváló</option>
                        <option value="Jó">Jó</option>
                        <option value="Megfelelő">Megfelelő</option>
                      </select>
                    </label>

                    <div>
                      <label className="muted text-xs uppercase tracking-wider block mb-2">Termék képek</label>
                      <ImageUpload
                        existingImages={editingProduct.images as string[]}
                        onImagesUploaded={(urls) => setEditingProduct({ ...editingProduct, images: urls })}
                      />
                      <p className="muted text-xs mt-2">Az első kép lesz a borítókép</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="btn flex-1 py-3"
                      >
                        Mégse
                      </button>
                      <button
                        type="submit"
                        className="btn-primary flex-1 py-3"
                      >
                        Mentés
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!showAddProduct && !editingProduct && (
                <div className="space-y-3">
                  {products.length === 0 ? (
                    <div className="card2 p-12 text-center">
                      <p className="text-xl font-bold tracking-tight">Még nincsenek termékek</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="card p-4 sm:p-6 hover:shadow-md transition">
                        <div className="flex gap-4">
                          {product.images && Array.isArray(product.images) && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                              <div className="min-w-0">
                                <h3 className="font-extrabold text-base sm:text-lg truncate">{product.name}</h3>
                                <p className="muted text-xs">{product.category}</p>
                              </div>
                              <p className="text-lg font-bold whitespace-nowrap">{product.price} Ft</p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs muted mb-3">
                              <span>Méret: {product.size}</span>
                              <span>•</span>
                              <span>Állapot: {product.condition}</span>
                              <span>•</span>
                              <span>Készlet: {product.stock}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="btn py-2 text-sm"
                              >
                                <Edit2 className="w-3 h-3" />
                                Szerkesztés
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="btn py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                                Törlés
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="card2 p-6">
              <OrderManagement />
            </div>
          )}

          {activeTab === 'design' && (
            <SiteSettings
              settings={siteSettings}
              onSettingsUpdated={loadSiteSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
}
