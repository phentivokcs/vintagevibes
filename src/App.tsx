import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/Login';
import { ProductDetail } from './components/ProductDetail';
import { PaymentResult } from './components/PaymentResult';
import { NewArrivals } from './components/NewArrivals';
import MyOrders from './components/MyOrders';
import CookieBanner from './components/CookieBanner';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import ShippingPolicy from './components/ShippingPolicy';
import { BarionPixel } from './components/BarionPixel';
import { ToastContainer, showToast } from './components/Toast';
import {
  supabase,
  type Product,
  getSessionId,
  reserveProduct,
  releaseReservation,
  completePurchase,
  cleanupExpiredReservations
} from './lib/supabase';
import type { User } from '@supabase/supabase-js';

type CartItem = Product & { quantity: number };

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionId] = useState(() => getSessionId());
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ gender: string; category: string } | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [showPaymentResult, setShowPaymentResult] = useState(false);
  const [showNewArrivals, setShowNewArrivals] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    loadProducts();
    loadSiteSettings();
    checkUser();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') || urlParams.get('orderId') || urlParams.get('paymentId')) {
      setShowPaymentResult(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setUser(session?.user ?? null);
        checkAdminStatus(session?.user ?? null);
      })();
    });

    const cleanupInterval = setInterval(() => {
      cleanupExpiredReservations();
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    checkAdminStatus(user);
  };

  const checkAdminStatus = (currentUser: User | null) => {
    if (currentUser) {
      const appMetadata = currentUser.app_metadata;
      setIsAdmin(appMetadata?.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
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
    } finally {
      setLoadingProducts(false);
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
    }
  };

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        alert('Ez a termék már a kosaradban van! Minden termékünk egyedi darab.');
        return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCheckout = async () => {
    try {
      const reservationResults = await Promise.all(
        cartItems.map(item => reserveProduct(item.id, sessionId))
      );

      const failedReservations = reservationResults.filter(result => !result.success);

      if (failedReservations.length > 0) {
        showToast('error', `Néhány termék már nem elérhető: ${failedReservations.map(r => r.error).join(', ')}`);
        loadProducts();
        return;
      }

      setShowCart(false);
      setShowCheckout(true);
    } catch (error) {
      console.error('Error during checkout:', error);
      showToast('error', 'Hiba történt a rendelés indításakor');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setShowAdmin(false);
  };

  const handleCategoryClick = (gender: string, category: string) => {
    setSelectedCategory({ gender, category });
    setShowCart(false);
    setShowCheckout(false);
    setShowAdmin(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowAllProducts = () => {
    setSelectedCategory(null);
  };

  const handleCompleteOrder = async (orderData: {
    customer: { name: string; email: string; phone: string };
    shipping: {
      name: string;
      address: string;
      city: string;
      postal_code: string;
      country: string;
    };
    billing: {
      name: string;
      address: string;
      city: string;
      postal_code: string;
      country: string;
    };
    notes: string;
  }) => {
    try {
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email: orderData.customer.email,
          name: orderData.customer.name,
          phone: orderData.customer.phone,
        })
        .select()
        .maybeSingle();

      if (customerError) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('*')
          .eq('email', orderData.customer.email)
          .maybeSingle();

        if (existingCustomer) {
          await createOrder(existingCustomer.id, orderData, total);
        } else {
          throw new Error('Nem sikerült létrehozni vagy megtalálni a vásárlót');
        }
      } else if (customer) {
        await createOrder(customer.id, orderData, total);
      }
    } catch (error) {
      console.error('Error completing order:', error);
      showToast('error', 'Hiba történt a rendelés feldolgozásakor');
    }
  };

  const createOrder = async (
    customerId: string,
    orderData: any,
    total: number
  ) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          status: 'pending',
          total_amount: total,
          shipping_address: orderData.shipping,
          billing_address: orderData.billing,
          notes: orderData.notes,
        })
        .select()
        .maybeSingle();

      if (orderError) throw orderError;

      if (order) {
        const orderItems = cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_purchase: item.price,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        for (const item of cartItems) {
          const purchaseResult = await completePurchase(item.id, sessionId);
          if (!purchaseResult.success) {
            console.error('Failed to complete purchase:', purchaseResult.error);
          }
        }

        setCartItems([]);
        setShowCheckout(false);
        loadProducts();
        showToast('success', 'Rendelés sikeresen leadva!');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('error', 'Hiba történt a rendelés leadásakor');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 bg-[radial-gradient(circle_at_20%_10%,rgba(251,191,36,0.14),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(0,0,0,0.06),transparent_35%)]">
      <BarionPixel />
      <div className="container-x py-6 overflow-visible">
        <Header
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setShowCart(true)}
          onLogoClick={() => {
            setShowCart(false);
            setShowCheckout(false);
            setShowAdmin(false);
            setSelectedCategory(null);
          }}
          isAuthenticated={!!user}
          isAdmin={isAdmin}
          onLoginClick={() => setShowLogin(true)}
          onLogoutClick={handleLogout}
          onAdminClick={() => setShowAdmin(true)}
          onMyOrdersClick={() => setShowMyOrders(true)}
          onCategoryClick={handleCategoryClick}
          selectedCategory={selectedCategory}
          onShowAllProducts={handleShowAllProducts}
        />

        <section className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white/60 shadow-sm mb-8">
          <div className="relative h-[340px] sm:h-[420px]">
            <img
              src={siteSettings?.hero_image || '/chatgpt_image_2025._nov._9._01_19_15.png'}
              className="absolute inset-0 h-full w-full object-cover"
              alt="Vintage streetwear collection"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/55 via-zinc-950/15 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(251,191,36,0.18),transparent_45%)]" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <div className="max-w-2xl">
              <div className="mb-2 flex flex-wrap gap-2">
                {(siteSettings?.hero_tags || ['válogatott vintage', '90-es évek', 'napi újdonságok']).map((tag: string) => (
                  <span key={tag} className="tag bg-white/80">{tag}</span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {siteSettings?.hero_title || 'Archív streetwear. Exkluzív darabok.'}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/80">
                {siteSettings?.hero_subtitle || 'Nike / Tommy / TNF / adidas – kézzel válogatva, felmérve, azonnal szállítható.'}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary"
                >
                  {siteSettings?.primary_button_text || 'Vásárlás'}
                </button>
                <button
                  onClick={() => setShowNewArrivals(true)}
                  className="btn bg-white/20 text-white border-white/25 hover:bg-white/25"
                >
                  {siteSettings?.secondary_button_text || 'Újdonságok'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <main id="products" className="py-8">
          <ProductGrid
            products={products}
            onAddToCart={handleAddToCart}
            onProductClick={setSelectedProduct}
            selectedCategory={selectedCategory}
            loading={loadingProducts}
          />
        </main>
      </div>

      {showCart && (
        <Cart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      )}

      {showCheckout && (
        <Checkout
          items={cartItems}
          onClose={async () => {
            for (const item of cartItems) {
              await releaseReservation(item.id, sessionId);
            }
            setShowCheckout(false);
          }}
          onComplete={handleCompleteOrder}
          onTermsClick={() => setShowTerms(true)}
          onPrivacyClick={() => setShowPrivacyPolicy(true)}
        />
      )}

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => {
            checkUser();
          }}
        />
      )}

      {showAdmin && isAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onProductAdded={() => {
            loadProducts();
            loadSiteSettings();
          }}
        />
      )}

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {showPrivacyPolicy && (
        <PrivacyPolicy onBack={() => setShowPrivacyPolicy(false)} />
      )}

      {showTerms && (
        <TermsAndConditions onBack={() => setShowTerms(false)} />
      )}

      {showShipping && (
        <ShippingPolicy onBack={() => setShowShipping(false)} />
      )}

      {showPaymentResult && (
        <PaymentResult
          onClose={() => {
            setShowPaymentResult(false);
            setCartItems([]);
            window.history.replaceState({}, '', '/');
            loadProducts();
          }}
        />
      )}

      {showMyOrders && user && (
        <MyOrders onClose={() => setShowMyOrders(false)} />
      )}

      {showNewArrivals && (
        <NewArrivals
          onClose={() => setShowNewArrivals(false)}
          onAddToCart={handleAddToCart}
          onProductClick={setSelectedProduct}
        />
      )}

      {!showPrivacyPolicy && !showTerms && !showShipping && (
        <Footer
          onPrivacyClick={() => setShowPrivacyPolicy(true)}
          onTermsClick={() => setShowTerms(true)}
          onShippingClick={() => setShowShipping(true)}
          footerLogoUrl={siteSettings?.barion_logo || '/medium-nobg-light.png'}
        />
      )}

      <CookieBanner />
      <ToastContainer />
    </div>
  );
}

export default App;
