'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
}

export default function StripePaymentForm({
  clientSecret,
  orderId,
  amount,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded. Make sure to disable form submission until Stripe.js has loaded.
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card details not entered.');
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {},
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'An unknown error occurred during payment.');
    } else {
      // Payment succeeded. Stripe webhook would normally update the order status.
      // Since there's no DB, we'll just redirect to a success page.
      router.push(`/order-confirmation?orderId=${orderId}&status=success&paymentMethod=stripe`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 p-3 border rounded-md bg-white">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
        disabled={!stripe || loading}
      >
        {loading ? 'Paying...' : `Pay ₹${amount.toFixed(2)}`}
      </button>
    </form>
  );
}
