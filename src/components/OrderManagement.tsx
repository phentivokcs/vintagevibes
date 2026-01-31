import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Search, Edit2, Send, Clock, CheckCircle, XCircle, Truck, Archive, MapPin, Download, ExternalLink } from 'lucide-react';

interface Order {
  id: string;
  customer_id: string;
  customer_email: string;
  customer_phone: string;
  shipping_name: string;
  status: 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  tracking_number: string;
  notes: string;
  created_at: string;
  status_updated_at: string;
  payment_status: string;
  payment_method: string;
  packeta_point_id?: string;
  packeta_point_name?: string;
  packeta_point_address?: string;
  packeta_packet_id?: string;
  packeta_tracking_url?: string;
  packeta_label_url?: string;
  packeta_barcode?: string;
  invoice_number?: string;
  invoice_id?: string;
  invoice_url?: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    images: string[];
  };
}

interface StatusHistory {
  id: string;
  old_status: string;
  new_status: string;
  notes: string;
  created_at: string;
  changed_by: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    tracking_number: '',
    notes: '',
    customer_email: '',
    customer_phone: ''
  });
  const [creatingPacketaShipment, setCreatingPacketaShipment] = useState(false);

  const statusOptions = [
    { value: 'processing', label: 'Feldolgozás alatt', icon: Clock, color: 'text-yellow-600' },
    { value: 'packed', label: 'Csomagolva', icon: Archive, color: 'text-blue-600' },
    { value: 'shipped', label: 'Elküldve', icon: Truck, color: 'text-purple-600' },
    { value: 'delivered', label: 'Kiszállítva', icon: CheckCircle, color: 'text-green-600' },
    { value: 'cancelled', label: 'Törölve', icon: XCircle, color: 'text-red-600' }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(search) ||
        order.customer_email?.toLowerCase().includes(search) ||
        order.tracking_number?.toLowerCase().includes(search)
      );
    }

    setFilteredOrders(filtered);
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      const [itemsResult, historyResult] = await Promise.all([
        supabase
          .from('order_items')
          .select('*, products(name, images)')
          .eq('order_id', orderId),
        supabase
          .from('order_status_history')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false })
      ]);

      if (itemsResult.error) throw itemsResult.error;
      if (historyResult.error) throw historyResult.error;

      setOrderItems(itemsResult.data || []);
      setStatusHistory(historyResult.data || []);
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditingOrder(null);
    loadOrderDetails(order.id);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order.id);
    setFormData({
      status: order.status,
      tracking_number: order.tracking_number || '',
      notes: order.notes || '',
      customer_email: order.customer_email || '',
      customer_phone: order.customer_phone || ''
    });
  };

  const handleUpdateOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: formData.status,
          tracking_number: formData.tracking_number,
          notes: formData.notes,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone
        })
        .eq('id', orderId);

      if (error) throw error;

      const order = orders.find(o => o.id === orderId);
      if (formData.customer_email && order?.status !== formData.status) {
        await sendStatusEmail(orderId, formData.customer_email, formData.status, formData.tracking_number);
      }

      await loadOrders();
      setEditingOrder(null);

      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, ...formData });
          loadOrderDetails(orderId);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Hiba történt a rendelés frissítése során');
    }
  };

  const sendStatusEmail = async (orderId: string, email: string, status: string, trackingNumber?: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-status-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            customerEmail: email,
            orderStatus: status,
            trackingNumber,
            orderTotal: order?.total_amount
          })
        }
      );

      if (!response.ok) {
        console.error('Failed to send email notification');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleCreatePacketaShipment = async (orderId: string) => {
    if (!confirm('Biztos létrehozod a Packeta szállítmányt?')) return;

    setCreatingPacketaShipment(true);
    try {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('packeta_api_password, packeta_api_id, packeta_sender_name, packeta_sender_phone')
        .maybeSingle();

      if (!settings || !settings.packeta_api_password || !settings.packeta_api_id) {
        alert('Packeta nincs konfigurálva. Állítsd be a beállításokban.');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/packeta-create-shipment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            packetaApiPassword: settings.packeta_api_password,
            packetaApiId: settings.packeta_api_id,
            senderName: settings.packeta_sender_name,
            senderPhone: settings.packeta_sender_phone,
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Packeta szállítmány sikeresen létrehozva!');
        await loadOrders();
        if (selectedOrder?.id === orderId) {
          const updatedOrder = orders.find(o => o.id === orderId);
          if (updatedOrder) setSelectedOrder(updatedOrder);
        }
      } else {
        alert(`Hiba: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating Packeta shipment:', error);
      alert('Hiba történt a szállítmány létrehozásakor');
    } finally {
      setCreatingPacketaShipment(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    return `${address.name || ''}, ${address.address || ''}, ${address.city || ''} ${address.zip || ''}, ${address.country || ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900">Rendelések kezelése</h2>
        </div>
        <div className="text-sm text-gray-500">
          Összes rendelés: {orders.length}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Keresés rendelésazonosító, email vagy tracking szám alapján..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Minden státusz</option>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Rendelések listája</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredOrders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedOrder?.id === order.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      <span className={`font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</div>
                    <div className="font-semibold text-gray-900">{order.total_amount.toLocaleString()} Ft</div>
                    {order.customer_email && (
                      <div className="text-gray-600">{order.customer_email}</div>
                    )}
                    {order.tracking_number && (
                      <div className="text-gray-500">🚚 {order.tracking_number}</div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nincs találat
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {selectedOrder ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Rendelés részletei</h3>
                {editingOrder !== selectedOrder.id && (
                  <button
                    onClick={() => handleEditOrder(selectedOrder)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Szerkesztés</span>
                  </button>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                {editingOrder === selectedOrder.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Státusz
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email cím
                      </label>
                      <input
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="vásárló@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefonszám
                      </label>
                      <input
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+36 ..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking szám
                      </label>
                      <input
                        type="text"
                        value={formData.tracking_number}
                        onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="TRACK123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Megjegyzések
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Belső megjegyzések..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleUpdateOrder(selectedOrder.id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Mentés
                      </button>
                      <button
                        onClick={() => setEditingOrder(null)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Mégse
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Rendelés azonosító</h4>
                      <p className="font-mono text-sm">{selectedOrder.id}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Státusz</h4>
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const StatusIcon = getStatusInfo(selectedOrder.status).icon;
                            return <StatusIcon className={`w-5 h-5 ${getStatusInfo(selectedOrder.status).color}`} />;
                          })()}
                          <span className={getStatusInfo(selectedOrder.status).color}>
                            {getStatusInfo(selectedOrder.status).label}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Összeg</h4>
                        <p className="font-semibold">{selectedOrder.total_amount.toLocaleString()} Ft</p>
                      </div>
                    </div>

                    {selectedOrder.customer_email && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                        <p>{selectedOrder.customer_email}</p>
                      </div>
                    )}

                    {selectedOrder.customer_phone && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Telefon</h4>
                        <p>{selectedOrder.customer_phone}</p>
                      </div>
                    )}

                    {selectedOrder.packeta_point_name ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>Packeta csomagpont</span>
                        </h4>
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="font-medium text-sm">{selectedOrder.packeta_point_name}</p>
                          <p className="text-xs text-gray-600 mt-1">{selectedOrder.packeta_point_address}</p>
                        </div>

                        {selectedOrder.packeta_packet_id ? (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 font-medium">Packeta szállítmány létrehozva</span>
                            </div>
                            {selectedOrder.packeta_barcode && (
                              <p className="text-xs font-mono bg-white px-2 py-1 rounded border">
                                Vonalkód: {selectedOrder.packeta_barcode}
                              </p>
                            )}
                            <div className="flex gap-2">
                              {selectedOrder.packeta_tracking_url && (
                                <a
                                  href={selectedOrder.packeta_tracking_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Követés
                                </a>
                              )}
                              {selectedOrder.packeta_label_url && (
                                <a
                                  href={selectedOrder.packeta_label_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                  <Download className="w-3 h-3" />
                                  Címke
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCreatePacketaShipment(selectedOrder.id)}
                            disabled={creatingPacketaShipment}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" />
                            {creatingPacketaShipment ? 'Létrehozás...' : 'Packeta szállítmány létrehozása'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Szállítási cím</h4>
                        <p className="text-sm">{formatAddress(selectedOrder.shipping_address)}</p>
                      </div>
                    )}

                    {selectedOrder.tracking_number && !selectedOrder.packeta_tracking_url && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Tracking szám</h4>
                        <p className="font-mono">{selectedOrder.tracking_number}</p>
                      </div>
                    )}

                    {selectedOrder.invoice_number && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Számla</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Számlaszám:</span>
                            <span className="font-mono text-sm">{selectedOrder.invoice_number}</span>
                          </div>
                          {selectedOrder.invoice_url && (
                            <a
                              href={selectedOrder.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Számla megtekintése</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Számlázási cím</h4>
                      <p className="text-sm">{formatAddress(selectedOrder.billing_address)}</p>
                    </div>

                    {selectedOrder.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Megjegyzések</h4>
                        <p className="text-sm bg-gray-50 p-3 rounded">{selectedOrder.notes}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Rendelt termékek</h4>
                      <div className="space-y-2">
                        {orderItems.map(item => (
                          <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                            {item.products?.images?.[0] && (
                              <img
                                src={item.products.images[0]}
                                alt={item.products?.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.products?.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity}x {item.price.toLocaleString()} Ft
                              </p>
                            </div>
                            <div className="font-semibold">
                              {(item.quantity * item.price).toLocaleString()} Ft
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {statusHistory.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Státusz előzmények</h4>
                        <div className="space-y-2">
                          {statusHistory.map(history => (
                            <div key={history.id} className="text-sm border-l-2 border-gray-300 pl-3 py-1">
                              <div className="flex items-center justify-between">
                                <span>
                                  {history.old_status && (
                                    <span className="text-gray-500">
                                      {getStatusInfo(history.old_status).label} →{' '}
                                    </span>
                                  )}
                                  <span className={getStatusInfo(history.new_status).color}>
                                    {getStatusInfo(history.new_status).label}
                                  </span>
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(history.created_at)}
                                </span>
                              </div>
                              {history.notes && (
                                <p className="text-gray-600 text-xs mt-1">{history.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Válassz egy rendelést a részletek megtekintéséhez
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
