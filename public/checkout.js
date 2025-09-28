
// public/checkout.js

document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkoutForm');
    const orderSummaryItems = document.getElementById('order-summary-items');
    const orderTotalPriceElement = document.getElementById('order-total-price');
    const checkoutErrorElement = document.getElementById('checkout-error');
    const upiQrSection = document.getElementById('upi-qr-section');
    const upiQrCodeElement = document.getElementById('upi-qr-code');
    const upiDeepLinkElement = document.getElementById('upi-deep-link');
    const upiAmountElement = document.getElementById('upi-amount');
    const upiTransactionRefElement = document.getElementById('upi-transaction-ref');

    let currentCart = getCart();
    let subtotal = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Render Order Summary
    function renderOrderSummary() {
        orderSummaryItems.innerHTML = '';
        if (currentCart.length === 0) {
            orderSummaryItems.innerHTML = '<p>Your cart is empty. Please add items before checking out.</p>';
            checkoutForm.querySelector('button[type="submit"]').disabled = true;
        } else {
            currentCart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item'; // Reusing cart-item style
                itemElement.innerHTML = `
                    <img src="./assets/images/${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name} (x${item.quantity})</h3>
                        <p>₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                `;
                orderSummaryItems.appendChild(itemElement);
            });
            orderTotalPriceElement.textContent = subtotal.toFixed(2);
        }
    }

    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        checkoutErrorElement.textContent = '';
        upiQrSection.style.display = 'none';

        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerAddress = document.getElementById('customerAddress').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        if (!customerName || !customerEmail || !customerAddress || !customerPhone) {
            checkoutErrorElement.textContent = 'Please fill in all customer details.';
            return;
        }

        if (currentCart.length === 0) {
            checkoutErrorElement.textContent = 'Your cart is empty.';
            return;
        }

        const currentOrderId = `ORDER-${Date.now()}`;
        checkoutForm.querySelector('button[type="submit"]').disabled = true;
        checkoutForm.querySelector('button[type="submit"]').textContent = 'Processing...';

        try {
            let upiDeepLink = null;
            let transactionReference = null;

            // 1. Create UPI Payment Intent
            if (paymentMethod === 'upi') {
                const upiRes = await fetch('/.netlify/functions/api/create-upi-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: currentOrderId, amount: subtotal, currency: 'INR' }),
                });

                if (!upiRes.ok) {
                    throw new Error('Failed to create UPI payment intent');
                }

                const upiData = await upiRes.json();
                upiDeepLink = upiData.upiDeepLink;
                transactionReference = upiData.transaction_reference;

                // Display UPI QR and link
                upiQrCodeElement.src = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(upiDeepLink)}`;
                upiDeepLinkElement.href = upiDeepLink;
                upiAmountElement.textContent = `₹${subtotal.toFixed(2)}`;
                upiTransactionRefElement.textContent = transactionReference;
                upiQrSection.style.display = 'block';
            }

            // 2. Send Telegram Notification
            await fetch('/.netlify/functions/api/send-order-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    customerAddress,
                    customerPhone,
                    cart: currentCart.map(item => ({ // Map to match backend expected structure
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    orderId: currentOrderId,
                    paymentMethod: paymentMethod,
                    transactionRef: transactionReference,
                }),
            });

            // 3. Send Email Notification
            await fetch('/.netlify/functions/api/send-order-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    customerEmail,
                    customerAddress,
                    customerPhone,
                    cart: currentCart.map(item => ({ // Map to match backend expected structure
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    orderId: currentOrderId,
                    paymentMethod: paymentMethod,
                    transactionRef: transactionReference,
                }),
            });

            // Clear cart and redirect to confirmation
            clearCart();
            window.location.href = `/order-confirmation.html?orderId=${currentOrderId}&paymentMethod=${paymentMethod}`;

        } catch (error) {
            console.error('Order placement error:', error);
            checkoutErrorElement.textContent = `Error placing order: ${error.message}`;
        } finally {
            checkoutForm.querySelector('button[type="submit"]').disabled = false;
            checkoutForm.querySelector('button[type="submit"]').textContent = 'Place Order';
        }
    });

    renderOrderSummary();
});
