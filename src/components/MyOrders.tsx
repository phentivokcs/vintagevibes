import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Clock, Archive, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, Download, MapPin, ExternalLink } from 'lucide-react';

interface Order {
  id: string;
  status: 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: any;
  tracking_number: string;
  created_at: string;
  status_updated_at: string;
  packeta_point_id?: string;
  packeta_point_name?: string;
  packeta_point_address?: string;
  packeta_packet_id?: string;
  packeta_tracking_url?: string;
  packeta_label_url?: string;
  packeta_barcode?: string;
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
  created_at: string;
}

interface MyOrdersProps {
  onClose: () => void;
}

export default function MyOrders({ onClose }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [statusHistories, setStatusHistories] = useState<Record<string, StatusHistory[]>>({});
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    { value: 'processing', label: 'Feldolgozás alatt', icon: Clock, color: 'bg-yellow-100 text-yellow-800', iconColor: 'text-yellow-600' },
    { value: 'packed', label: 'Csomagolva', icon: Archive, color: 'bg-blue-100 text-blue-800', iconColor: 'text-blue-600' },
    { value: 'shipped', label: 'Elküldve', icon: Truck, color: 'bg-purple-100 text-purple-800', iconColor: 'text-purple-600' },
    { value: 'delivered', label: 'Kiszállítva', icon: CheckCircle, color: 'bg-green-100 text-green-800', iconColor: 'text-green-600' },
    { value: 'cancelled', label: 'Törölve', icon: XCircle, color: 'bg-red-100 text-red-800', iconColor: 'text-red-600' }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    if (orderItems[orderId]) return;

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

      setOrderItems(prev => ({ ...prev, [orderId]: itemsResult.data || [] }));
      setStatusHistories(prev => ({ ...prev, [orderId]: historyResult.data || [] }));
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      loadOrderDetails(orderId);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('hu-HU', {
      year: 'numeric',
      month: 'long',
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">Betöltés...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Rendeléseim</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Még nincs rendelésed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrderId === order.id;
                const items = orderItems[order.id] || [];
                const history = statusHistories[order.id] || [];

                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`w-6 h-6 ${statusInfo.iconColor}`} />
                          <div>
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-bold text-lg text-gray-900">
                              {order.total_amount.toLocaleString()} Ft
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-500 font-mono">
                          Rendelésszám: #{order.id.slice(0, 8)}
                        </div>
                        {order.tracking_number && (
                          <div className="text-gray-600 flex items-center space-x-1">
                            <Truck className="w-4 h-4" />
                            <span>{order.tracking_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                        {order.packeta_point_name ? (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Packeta csomagpont
                            </h4>
                            <div className="bg-white px-4 py-3 rounded border border-gray-200">
                              <p className="text-sm font-medium text-gray-900">{order.packeta_point_name}</p>
                              <p className="text-xs text-gray-600 mt-1">{order.packeta_point_address}</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Szállítási cím</h4>
                            <p className="text-sm text-gray-600">{formatAddress(order.shipping_address)}</p>
                          </div>
                        )}

                        {order.packeta_tracking_url && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Packeta nyomkövetés</h4>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <a
                                href={order.packeta_tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Csomag követése
                              </a>
                              {order.packeta_label_url && (
                                <a
                                  href={order.packeta_label_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Címke letöltése
                                </a>
                              )}
                            </div>
                            {order.packeta_barcode && (
                              <p className="text-xs text-gray-600 mt-2 font-mono">
                                Vonalkód: {order.packeta_barcode}
                              </p>
                            )}
                          </div>
                        )}

                        {order.tracking_number && !order.packeta_tracking_url && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Követési szám</h4>
                            <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border border-gray-200">
                              {order.tracking_number}
                            </p>
                          </div>
                        )}

                        {items.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Rendelt termékek</h4>
                            <div className="space-y-2">
                              {items.map(item => (
                                <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                  {item.products?.images?.[0] && (
                                    <img
                                      src={item.products.images[0]}
                                      alt={item.products?.name}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.products?.name}</p>
                                    <p className="text-sm text-gray-500">
                                      Mennyiség: {item.quantity}
                                    </p>
                                  </div>
                                  <div className="font-semibold text-gray-900">
                                    {(item.quantity * item.price).toLocaleString()} Ft
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {history.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Státusz előzmények</h4>
                            <div className="space-y-2">
                              {history.map((h, index) => {
                                const historyStatusInfo = getStatusInfo(h.new_status);
                                const HistoryIcon = historyStatusInfo.icon;

                                return (
                                  <div
                                    key={h.id}
                                    className={`flex items-start space-x-3 p-3 bg-white rounded-lg border ${
                                      index === 0 ? 'border-blue-300' : 'border-gray-200'
                                    }`}
                                  >
                                    <HistoryIcon className={`w-5 h-5 mt-0.5 ${historyStatusInfo.iconColor}`} />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">
                                          {historyStatusInfo.label}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {formatDate(h.created_at)}
                                        </span>
                                      </div>
                                      {h.old_status && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Előző státusz: {getStatusInfo(h.old_status).label}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
