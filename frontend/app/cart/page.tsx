'use client';

import { useCart } from '../CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { cart, loading, error, removeFromCart, updateQuantity } = useCart();

  if (loading) return <p className="text-center mt-8">Loading cart...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center border-b py-4">
                <div className="w-24 h-24 relative mr-4">
                  <Image src={JSON.parse(item.images)[0]} alt={item.name} layout="fill" objectFit="cover" className="rounded-md" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 border rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 border rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-1 bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between text-lg mb-2">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded mt-4 text-center block">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
