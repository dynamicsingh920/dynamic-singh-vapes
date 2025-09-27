'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<p className="text-center mt-8">Loading order confirmation...</p>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('orderId');
    const method = searchParams.get('paymentMethod');

    if (id && method) {
      setOrderId(id);
      setPaymentMethod(method);
    } else {
      // If no orderId or paymentMethod, redirect to home or cart
      router.push('/');
    }
  }, [searchParams, router]);

  if (!orderId || !paymentMethod) {
    return <p className="text-center mt-8">Loading order confirmation...</p>;
  }

  return (
    <main className="container mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
      <p className="text-lg mb-2">Your order ID is: <strong className="text-blue-600">{orderId}</strong></p>
      <p className="text-lg mb-6">Payment Method: <strong>{paymentMethod.toUpperCase()}</strong></p>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
        <p className="font-bold">Important:</p>
        <p>Your payment is currently awaiting manual verification. We will process your order once the payment is confirmed.</p>
        <p>Please check your email for a confirmation message with order details.</p>
      </div>

      <div className="flex justify-center space-x-4">
        <Link href="/products" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Continue Shopping
        </Link>
        {/* In a real app, you might link to an order history page here */}
      </div>
    </main>
  );
}