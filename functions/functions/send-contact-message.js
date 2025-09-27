const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { name, email, message } = JSON.parse(event.body);
    const { BOT_TOKEN, CHAT_ID } = process.env;

    if (!BOT_TOKEN || !CHAT_ID) {
        return { statusCode: 500, body: 'Bot token or Chat ID not configured.' };
    }

    const text = `*New Contact Form Message*\n\n*Name:* ${name}\n*Email:* ${email}\n\n*Message:*\n${message}`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = {
        chat_id: CHAT_ID,
        text: text,
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

        return { statusCode: 200, body: 'Message sent successfully!' };

    } catch (error) {
        return { statusCode: 500, body: `Error sending message: ${error.message}` };
    }
};
