// functions/api/send-order-notification.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { customerName, customerAddress, customerPhone, cart, orderId, paymentMethod, transactionRef } = JSON.parse(event.body);
  const { BOT_TOKEN, CHAT_ID } = process.env;

  if (!BOT_TOKEN || !CHAT_ID) {
    return { statusCode: 500, body: 'Telegram Bot Token or Chat ID not configured.' };
  }

  let message = `*New Order Received!*\n\n`;
  message += `*Order ID:* ${orderId}\n`;
  message += `*Payment Method:* ${paymentMethod.toUpperCase()}\n`;
  if (transactionRef) {
    message += `*Transaction Ref:* ${transactionRef}\n`;
  }
  message += `\n*Customer Details:*\n`;
  message += `- Name: ${customerName}\n`;
  message += `- Address: ${customerAddress}\n`;
  message += `- Phone: ${customerPhone}\n`;
  message += `\n*Order Items:*\n`;

  let total = 0;
  cart.forEach(item => {
    message += `- ${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}\n`;
    total += item.price * item.quantity;
  });
  message += `\n*Total Amount: ₹${total.toFixed(2)}*`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: "Markdown"
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.ok) {
      console.error('Telegram API Error:', data);
      return { statusCode: 500, body: `Telegram API Error: ${data.description}` };
    }

    return { statusCode: 200, body: 'Order notification sent successfully!' };

  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return { statusCode: 500, body: `Error sending Telegram notification: ${error.message}` };
  }
};