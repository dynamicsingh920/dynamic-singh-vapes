import Link from 'next/link';

// Define a type for your product for TypeScript
export interface Product {
  id: number;
  name: string;
  price: number;
  images: string; // Assuming images is a JSON string of URLs
}

export default function ProductCard({ product }: { product: Product }) {
  // Parse the images JSON string and get the first image, or use a placeholder
  const imageUrl = product.images ? JSON.parse(product.images)[0] : 'https://via.placeholder.com/300';

  return (
    <Link href={`/products/${product.id}`} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img src={imageUrl} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-gray-600 mt-2">₹{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
