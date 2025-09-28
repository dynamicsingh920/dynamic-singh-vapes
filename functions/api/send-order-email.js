
// functions/api/send-order-email.js
const sgMail = require('@sendgrid/mail');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { SENDGRID_API_KEY, ADMIN_EMAIL, SENDER_EMAIL } = process.env;

  if (!SENDGRID_API_KEY || !ADMIN_EMAIL || !SENDER_EMAIL) {
    console.error('SendGrid environment variables not configured.');
    // Return a successful response to the client, as this is a background notification task
    // The primary user flow should not be blocked by a notification failure.
    return { statusCode: 200, body: 'Email settings not configured, but order processed.' };
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const {
    customerName,
    customerEmail,
    customerAddress,
    customerPhone,
    cart,
    orderId,
    paymentMethod,
    transactionRef
  } = JSON.parse(event.body);

  if (!customerEmail) {
      return { statusCode: 400, body: 'Customer email is required.' };
  }

  let total = 0;
  const itemsHtml = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name} (x${item.quantity})</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${itemTotal.toFixed(2)}</td>
      </tr>`;
  }).join('');

  // 1. Email to the Customer
  const customerMsg = {
    to: customerEmail,
    from: SENDER_EMAIL,
    subject: `Your Order Confirmation (#${orderId})`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #000;">Thank you for your order, ${customerName}!</h1>
        <p>We've received your order and will process it shortly.</p>
        <h2>Order Summary</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
        ${transactionRef ? `<p><strong>Transaction Reference:</strong> ${transactionRef}</p>` : ''}
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 10px; border-bottom: 2px solid #000; text-align: left;">Item</th>
              <th style="padding: 10px; border-bottom: 2px solid #000; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Total</td>
              <td style="padding: 10px; font-weight: bold; text-align: right;">₹${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <h3 style="margin-top: 20px;">Shipping Details</h3>
        <p>
          ${customerName}<br>
          ${customerAddress}<br>
          ${customerPhone}
        </p>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">If you have any questions, please reply to this email.</p>
      </div>
    `,
  };

  // 2. Notification Email to the Admin
  const adminMsg = {
    to: ADMIN_EMAIL,
    from: SENDER_EMAIL,
    subject: `New Order Received: #${orderId}`,
    text: `You have a new order!

Order ID: ${orderId}
Customer: ${customerName} (${customerEmail})
Total: ₹${total.toFixed(2)}

See Telegram for full details.`,
  };

  try {
    await sgMail.send(customerMsg);
    await sgMail.send(adminMsg);
    return { statusCode: 200, body: 'Order emails sent successfully!' };
  } catch (error) {
    console.error('Error sending emails with SendGrid:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    // Again, don't block the user for a notification failure
    return { statusCode: 200, body: 'Error sending emails, but order processed.' };
  }
};
