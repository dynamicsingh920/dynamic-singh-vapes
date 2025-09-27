'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function CheckoutPage() {
  const { cart, loading: cartLoading, error: cartError } = useCart();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState('upi'); // Default to UPI
  const [upiDeepLink, setUpiDeepLink] = useState<string | null>(null);
  const [transactionReference, setTransactionReference] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Customer details state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    if (!cartLoading && cart.length === 0) {
      router.push('/cart'); // Redirect to cart if empty
    }
  }, [cart, cartLoading, router]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    setUpiDeepLink(null);
    setTransactionReference(null);

    // Basic validation for customer details
    if (!customerName || !customerEmail || !customerAddress || !customerPhone) {
      setCheckoutError('Please fill in all customer details.');
      setCheckoutLoading(false);
      return;
    }

    const currentOrderId = `ORDER-${Date.now()}`;

    try {
      if (paymentMethod === 'upi') {
        const res = await fetch('/.netlify/functions/api/create-upi-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: currentOrderId, amount: subtotal, currency: 'INR' }),
        });

        if (!res.ok) {
          throw new Error('Failed to create UPI payment intent');
        }

        const data = await res.json();
        setUpiDeepLink(data.upiDeepLink);
        setTransactionReference(data.transaction_reference);

      } else { // Default to UPI if no other method is selected
        setCheckoutError('Invalid payment method selected.');
        setCheckoutLoading(false);
        return;
      }

      // Send Telegram notification after payment intent is created
      await fetch('/.netlify/functions/api/send-order-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerAddress,
          customerPhone,
          cart,
          orderId: currentOrderId,
          paymentMethod: paymentMethod,
          transactionRef: transactionReference,
        }),
      });

      // Send Email notification after payment intent is created
      await fetch('/.netlify/functions/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerAddress,
          customerPhone,
          cart,
          orderId: currentOrderId,
          paymentMethod: paymentMethod,
          transactionRef: transactionReference,
        }),
      });

      // Redirect to a generic success page
      router.push(`/order-confirmation?orderId=${currentOrderId}&paymentMethod=${paymentMethod}`);

    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartLoading) return <p className="text-center mt-8">Loading cart...</p>;
  if (cartError) return <p className="text-center mt-8 text-red-500">Error: {cartError}</p>;
  if (cart.length === 0) return null; // Should redirect by useEffect

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="border rounded-lg p-4 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between py-2 border-b last:border-b-0">
                <span>{item.name} (x{item.quantity})</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-xl mt-4">
              <span>Total:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address Form */}
          <h2 className="text-2xl font-bold mb-4">Customer & Shipping Details</h2>
          <div className="border rounded-lg p-4 mb-4 space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-gray-700 text-sm font-bold mb-2">Full Name:</label>
              <input type="text" id="customerName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
              <input type="email" id="customerEmail" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="customerAddress" className="block text-gray-700 text-sm font-bold mb-2">Shipping Address:</label>
              <textarea id="customerAddress" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="customerPhone" className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
              <input type="tel" id="customerPhone" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
          <div className="mb-4">
            <label className="inline-flex items-center mr-4">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={() => setPaymentMethod('upi')}
              />
              <span className="ml-2">UPI (PhonePe, GPay, Paytm)</span>
            </label>
            {/* Removed Stripe radio button */}
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded mt-4"
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Processing...' : 'Place Order'}
          </button>

          {checkoutError && <p className="text-red-500 mt-4">Error: {checkoutError}</p>}

          {upiDeepLink && transactionReference && paymentMethod === 'upi' && (
            <div className="mt-8 p-4 border rounded-lg bg-yellow-50">
              <h3 className="text-xl font-bold mb-4">Complete UPI Payment</h3>
              <p className="mb-2">Scan the QR code or click the link below to pay <strong>₹{subtotal.toFixed(2)}</strong> using your preferred UPI app.</p>
              <p className="mb-2">Transaction Reference: <strong>{transactionReference}</strong></p>
              
              <div className="flex justify-center my-4">
                <QRCodeSVG value={upiDeepLink} size={256} level="H" />
              </div>

              <a
                href={upiDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Pay with UPI App
              </a>

              <p className="text-sm text-gray-600 mt-4">After successful payment, your order status will be updated shortly. Please do not close this page until payment is complete.</p>
            </div>
          )}

          {/* Removed Stripe payment form section */}
        </div>
      </div>
    </main>
  );
}