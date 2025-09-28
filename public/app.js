
// public/app.js

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');

    async function fetchProducts() {
        try {
            const response = await fetch('./data/retail_website_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
        }
    }

    function displayProducts(products) {
        if (!productGrid) return;
        productGrid.innerHTML = ''; // Clear existing content

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="./assets/images/${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">₹${product.sale_price.toFixed(2)}</p>
                <button data-product-id="${product.id}">Add to Cart</button>
            `;
            
            const addButton = productCard.querySelector('button');
            addButton.addEventListener('click', () => {
                // Ensure product object passed to cart has all necessary properties
                addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.sale_price,
                    image: product.image
                });
            });

            productGrid.appendChild(productCard);
        });
    }

    fetchProducts();
});
