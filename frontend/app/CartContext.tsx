'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define types for cart items
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  images: string; // Assuming images is a JSON string of URLs
}

interface Product {
  id: number;
  name: string;
  price: number;
  images: string;
  stock: number;
  // Add other product properties as needed
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Function to get or create a session ID (still useful for tracking, even if cart is local)
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productsData, setProductsData] = useState<Product[]>([]);

  // Load products data once
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/data/retail_website_data.json');
        if (!res.ok) throw new Error('Failed to load products data');
        const data = await res.json();
        setProductsData(data.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products data');
      }
    };
    loadProducts();
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (productsData.length > 0) { // Ensure products are loaded before initializing cart
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      setLoading(false);
    }
  }, [productsData]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) { // Only save once initial load is done
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, loading]);

  const addToCart = (productId: number, quantity: number) => {
    const productToAdd = productsData.find(p => p.id === productId);
    if (!productToAdd) {
      setError('Product not found.');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [
          ...prevCart,
          { id: productToAdd.id, name: productToAdd.name, price: productToAdd.price, images: productToAdd.images, quantity },
        ];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, loading, error }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
