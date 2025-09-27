import AddToCartSection from './AddToCartSection';
import ReviewForm from './ReviewForm';

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string; // JSON string of image URLs
  stock: number;
}

async function getProduct(id: string): Promise<ProductDetail> {
  const res = await fetch('/data/retail_website_data.json');
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await res.json();
  const product = data.products.find((p: ProductDetail) => p.id.toString() === id);

  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  const images = JSON.parse(product.images);

  return (
    <main className="container mx-auto p-4">
      {/* Product Details Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <img src={images[0]} alt={product.name} className="w-full rounded-lg shadow-lg" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-gray-800 mb-4">₹{product.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <AddToCartSection
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            productStock={product.stock}
          />

          <p className="text-sm text-gray-500 mt-4">{product.stock} in stock</p>
        </div>
      </div>

      {/* Review Submission Form */}
      <ReviewForm productId={product.id} productName={product.name} />
    </main>
  );
}
