import { useState, useEffect } from 'react';
import { X, Plus, Package, ShoppingBag, Palette } from 'lucide-react';
import { supabase, type Product, type Order } from '../lib/supabase';
import { ImageUpload } from './ImageUpload';
import { SiteSettings } from './SiteSettings';

type AdminPanelProps = {
  onClose: () => void;
  onProductAdded: () => void;
};

export function AdminPanel({ onClose, onProductAdded }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'design'>('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    size: '',
    condition: 'Good',
    category: '',
    images: [] as string[],
    stock: '1',
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'design') {
      loadSiteSettings();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  const loadSiteSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle();

    if (!error && data) {
      setSiteSettings(data);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('products').insert({
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      size: newProduct.size,
      condition: newProduct.condition,
      category: newProduct.category,
      images: newProduct.images,
      stock: parseInt(newProduct.stock),
      sold: false,
    });

    if (!error) {
      setNewProduct({
        name: '',
        description: '',
        price: '',
        size: '',
        condition: 'Good',
        category: '',
        images: [],
        stock: '1',
      });
      setShowAddProduct(false);
      onProductAdded();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (!error) {
      loadOrders();
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
              {!showAddProduct ? (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="btn-primary w-full py-4"
                >
                  <Plus className="w-4 h-4" />
                  Új termék
                </button>
              ) : (
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
                        <input
                          type="text"
                          required
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="input"
                          placeholder="Kabátok, Felsők, Ruhák..."
                        />
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
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="card2 p-12 text-center">
                  <p className="text-xl font-bold tracking-tight">Még nincsenek rendelések</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="card p-4 sm:p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-extrabold text-lg">Rendelés #{order.id.slice(0, 8)}</h3>
                        <p className="muted text-xs mt-1">
                          {new Date(order.created_at).toLocaleString('hu-HU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {order.total_amount} Ft
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 mb-4">
                      <div>
                        <p className="muted text-xs uppercase tracking-wider mb-2">Szállítási cím</p>
                        <p className="text-sm font-semibold">{order.shipping_address.name}</p>
                        <p className="text-sm muted">{order.shipping_address.address}</p>
                        <p className="text-sm muted">
                          {order.shipping_address.city}, {order.shipping_address.postal_code}
                        </p>
                      </div>
                      <div>
                        <label className="space-y-1">
                          <span className="muted text-xs uppercase tracking-wider">Állapot</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="input text-sm"
                          >
                            <option value="pending">Függőben</option>
                            <option value="paid">Fizetve</option>
                            <option value="shipped">Szállítva</option>
                            <option value="delivered">Kézbesítve</option>
                            <option value="cancelled">Törölve</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="card p-3 mt-3">
                        <p className="muted text-xs uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-sm">{order.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
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
