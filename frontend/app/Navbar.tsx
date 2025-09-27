'use client';

import Link from 'next/link';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

export default function Navbar() {
  const { user, login, logout, authReady } = useAuth();
  const { cart } = useCart();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold">ShopKing</Link>
          <Link href="/products" className="hover:text-gray-300">Products</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative hover:text-gray-300">
            🛒
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          {authReady && (
            <button onClick={user ? logout : login} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {user ? 'Logout' : 'Login / Sign Up'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
