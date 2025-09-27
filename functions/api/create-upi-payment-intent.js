// functions/api/create-upi-payment-intent.js
const { v4: uuidv4 } = require('uuid');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { orderId, amount } = JSON.parse(event.body);

  if (!orderId || !amount) {
    return { statusCode: 400, body: 'Order ID and amount are required.' };
  }

  try {
    // Get merchant UPI ID and Name from environment variables
    const merchantUpiId = process.env.MERCHANT_UPI_ID;
    const merchantName = process.env.MERCHANT_NAME;

    if (!merchantUpiId || !merchantName) {
      return { statusCode: 500, body: 'UPI settings not configured in environment variables.' };
    }

    const transaction_reference = uuidv4(); // Unique reference for this UPI transaction
    const currency = 'INR'; // Assuming INR for UPI

    // Construct UPI deep link
    const upiDeepLink = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=${currency}&tr=${transaction_reference}`;

    // No database interaction to record payment intent

    return {
      statusCode: 200,
      body: JSON.stringify({ upiDeepLink, transaction_reference }),
    };

  } catch (error) {
    console.error('Error creating UPI payment intent:', error);
    return { statusCode: 500, body: `Error creating UPI payment intent: ${error.message}` };
  }
};