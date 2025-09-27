'use client';

import { useState } from 'react';
import { useCart } from '../../CartContext';

interface ProductDetailProps {
  productId: number;
  productName: string;
  productPrice: number;
  productStock: number;
}

export default function AddToCartSection({
  productId,
  productName,
  productPrice,
  productStock,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(productId, quantity);
    // Optionally, show a success message or redirect to cart
  };

  return (
    <div className="flex items-center mb-4">
      <input
        type="number"
        min="1"
        max={productStock} // Limit quantity to available stock
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
        className="w-20 p-2 border rounded-md mr-4 text-black"
      />
      <button
        onClick={handleAddToCart}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
        disabled={productStock === 0}
      >
        {productStock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
}
