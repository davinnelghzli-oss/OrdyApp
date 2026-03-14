import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { MenuItem } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { getBusiness, getMenu, getPaymentMethods, createOrder } from '../utils/api';

interface PaymentMethod {
  id: string;
  type: 'bank' | 'ewallet' | 'cash';
  name: string;
  accountNumber?: string;
  accountName?: string;
  qrCodeImage?: string;
}

export default function ConsumerOrder() {
  const { businessId } = useParams();
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  useEffect(() => {
    if (businessId) {
      loadBusinessData();
    }
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Load business info
      const business = await getBusiness(businessId!);
      setBusinessInfo(business);

      // Load menu
      const menuData = await getMenu(businessId!);
      setMenuItems(menuData.items || []);

      // Load payment methods
      const paymentData = await getPaymentMethods(businessId!);
      setPaymentMethods(paymentData.methods || []);
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((c) => c.item.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(
      cart
        .map((c) =>
          c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.item.id !== itemId));
  };

  const total = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const availableItems = menuItems.filter((item) => item.available);
  const categories = Array.from(new Set(availableItems.map((item) => item.category)));

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }

    const paymentMethod = paymentMethods.find((p) => p.id === selectedPayment);
    if (!paymentMethod) return;

    const order = {
      id: `order_${Date.now()}`,
      businessId: businessId || '',
      items: cart.map((c) => ({ menuItem: c.item, quantity: c.quantity })),
      tableNumber: tableNumber || undefined,
      queueNumber: `Q${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`,
      paymentMethod,
      total,
      status: 'pending' as const,
      createdAt: new Date(),
      customerName: customerName || undefined,
      notes: notes || undefined,
    };

    try {
      const response = await createOrder(order);
      setCurrentOrder(response);
      setOrderPlaced(true);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const resetOrder = () => {
    setCart([]);
    setTableNumber('');
    setCustomerName('');
    setNotes('');
    setSelectedPayment('');
    setShowCheckout(false);
    setOrderPlaced(false);
    setCurrentOrder(null);
  };

  if (!businessInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Business not found</p>
          <Link to="/" className="text-emerald-600 hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced && currentOrder) {
    const selectedPaymentMethod = paymentMethods.find(
      (p) => p.id === currentOrder.paymentMethod.id
    );

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl mb-2 text-gray-900">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-6">Your queue number is:</p>
              <div className="text-5xl text-emerald-600 mb-8">{currentOrder.queueNumber}</div>

              {currentOrder.tableNumber && (
                <p className="text-gray-600 mb-4">Table Number: {currentOrder.tableNumber}</p>
              )}

              {/* Payment Instructions */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg mb-4 text-gray-900">Payment Details</h3>
                <p className="text-gray-600 mb-2">
                  Payment Method: {selectedPaymentMethod?.name}
                </p>
                <p className="text-2xl text-gray-900 mb-4">
                  Total: RM{total.toFixed(2)}
                </p>

                {selectedPaymentMethod?.type !== 'cash' && (
                  <div className="bg-white p-4 rounded-lg inline-block">
                    {selectedPaymentMethod?.qrCodeImage ? (
                      <div>
                        <img
                          src={selectedPaymentMethod.qrCodeImage}
                          alt="Payment QR Code"
                          className="w-[200px] h-[200px] object-contain mx-auto"
                        />
                        <p className="text-sm text-gray-600 mt-2">Scan to pay</p>
                      </div>
                    ) : (
                      <>
                        <QRCodeSVG
                          value={JSON.stringify({
                            orderId: currentOrder.id,
                            amount: total,
                            paymentMethod: selectedPaymentMethod?.name,
                            accountNumber: selectedPaymentMethod?.accountNumber,
                            accountName: selectedPaymentMethod?.accountName,
                          })}
                          size={200}
                          level="H"
                        />
                        <p className="text-sm text-gray-600 mt-2">Scan to pay</p>
                      </>
                    )}
                    {selectedPaymentMethod?.accountNumber && (
                      <div className="mt-3 text-sm text-gray-700">
                        <p>Account: {selectedPaymentMethod.accountNumber}</p>
                        {selectedPaymentMethod.accountName && (
                          <p>Name: {selectedPaymentMethod.accountName}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedPaymentMethod?.type === 'cash' && (
                  <p className="text-gray-700">Please pay at the cashier</p>
                )}
              </div>

              <div className="space-y-3">
                <Link
                  to="/"
                  className="block w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Back to Home
                </Link>
                <button
                  onClick={resetOrder}
                  className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Place Another Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl text-gray-900">Checkout</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4 text-gray-900">Order Summary</h2>
              <div className="space-y-3">
                {cart.map((c) => (
                  <div key={c.item.id} className="flex justify-between">
                    <div>
                      <p className="text-gray-900">
                        {c.item.name} x {c.quantity}
                      </p>
                    </div>
                    <p className="text-gray-900">RM{(c.item.price * c.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between text-lg">
                  <p className="text-gray-900">Total</p>
                  <p className="text-gray-900">RM{total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Table Number */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4 text-gray-900">Table Number (Optional)</h2>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter your table number"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Customer Name */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4 text-gray-900">Customer Name (Optional)</h2>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4 text-gray-900">Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any special instructions"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4 text-gray-900">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{method.type}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-lg"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              {businessInfo.logo && (
                <img
                  src={businessInfo.logo}
                  alt={businessInfo.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-xl text-gray-900">{businessInfo.name}</h1>
                <p className="text-sm text-gray-600">{businessInfo.description}</p>
              </div>
            </div>
            <button
              onClick={() => cart.length > 0 && setShowCheckout(true)}
              className="relative"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, c) => sum + c.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container mx-auto px-4 py-8">
        {availableItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No menu items available at the moment</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryItems = availableItems.filter(
                (item) => item.category === category
              );
              return (
                <div key={category}>
                  <h2 className="text-2xl mb-4 text-gray-900">{category}</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryItems.map((item) => {
                      const cartItem = cart.find((c) => c.item.id === item.id);
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-video bg-gray-200">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-lg text-emerald-600">RM{item.price.toFixed(2)}</p>
                              {cartItem ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-8 text-center">{cartItem.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(item)}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {cart.reduce((sum, c) => sum + c.quantity, 0)} items
              </p>
              <p className="text-xl text-gray-900">RM{total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}