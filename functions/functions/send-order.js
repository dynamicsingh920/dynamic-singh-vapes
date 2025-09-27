
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { customerName, customerAddress, customerPhone, cart } = JSON.parse(event.body);
    const { BOT_TOKEN, CHAT_ID } = process.env;

    if (!BOT_TOKEN || !CHAT_ID) {
        return { statusCode: 500, body: 'Bot token or Chat ID not configured.' };
    }

    let message = `*New Order*\n\n*Customer Name:* ${customerName}\n*Customer Address:* ${customerAddress}\n*Customer Phone:* ${customerPhone}\n\n*Order Details:*\n`;
    let total = 0;
    cart.forEach(item => {
        message += `- ${item.product.name} (x${item.quantity}) - ₹${item.product.sale_price * item.quantity}\n`;
        total += item.product.sale_price * item.quantity;
    });
    message += `\n*Total: ₹${total}*`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (!data.ok) {
            return { statusCode: 500, body: `Telegram API Error: ${data.description}` };
        }

        return { statusCode: 200, body: 'Order placed successfully!' };

    } catch (error) {
        return { statusCode: 500, body: `Error sending message: ${error.message}` };
    }
};
