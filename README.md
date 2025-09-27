# Dynamic Vapes Website

This is a simple e-commerce website for a vape shop with a secure Telegram bot integration for order notifications.

## Security Repair

The original code had a major security vulnerability where the Telegram Bot Token was exposed in the frontend JavaScript. This has been fixed by:

1.  Moving the Telegram notification logic to a secure Netlify serverless function (`/netlify/functions/send-order.js`).
2.  Removing the bot token from all frontend code (`app.js`).
3.  Configuring both the serverless function and the Python script (`telegram_bot.py`) to use environment variables, so secrets are not stored in the code.

## Project Setup

### 1. Environment Variables

You must provide your Telegram Bot Token and Chat ID for the application to work, along with SendGrid credentials.

-   Create a new file named `.env` in the root of the project.
-   Copy the contents of `example.env` into your new `.env` file.
-   Replace the placeholder values with your actual credentials.

**Your `.env` file should look like this:**
```
BOT_TOKEN=12345:your_actual_telegram_bot_token
CHAT_ID=123456789
MERCHANT_UPI_ID=your_upi_id@bank
MERCHANT_NAME=Your Store Name
SENDGRID_API_KEY=SG.your_sendgrid_api_key
ADMIN_EMAIL=your_admin_email@example.com
SENDER_EMAIL=noreply@yourdomain.com
```

The `.env` file is included in `.gitignore` and will not be committed to your repository.

### 2. Static Product Data Management

Since there is no database, product information is managed through static files:

-   **Product Data:** Edit `frontend/public/data/retail_website_data.json` to add, remove, or modify product details (name, price, description, images, etc.). Ensure the JSON format is valid.
-   **Product Images:** Place all product image files (e.g., `vapegin.jpg`, `elux.jpg`) into the `frontend/public/assets/images/` directory. The image filenames in `retail_website_data.json` must exactly match the files in this directory.

After making changes to these files, you will need to rebuild and redeploy your site for the changes to appear.

### 3. Install Dependencies

This project uses Node.js to run the serverless function. Install the necessary packages using npm:

```bash
npm install
```

### 4. Local Development

To run the website locally with the serverless function, you can use the Netlify CLI.

```bash
# Install the Netlify CLI (if you haven't already)
npm install -g netlify-cli

# Run the local development server
netlify dev
```

This will start a local server, typically on `http://localhost:8888`, that serves your website and runs your serverless function.

### 5. Running the Python Script

The Python script (`telegram_bot.py`) can be run to post all products to your Telegram channel. Make sure your `.env` file is set up correctly. You may need to install a library to load the environment variables from the `.env` file.

```bash
# Recommended: Use a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install requests python-dotenv

# Run the script
python scripts/telegram_bot.py
```

## Deployment

When you deploy this site to Netlify, you must also set all required environment variables in the Netlify UI:

1.  Go to your site's settings in Netlify.
2.  Navigate to **Build & deploy > Environment**.
3.  Add the `BOT_TOKEN`, `CHAT_ID`, `MERCHANT_UPI_ID`, `MERCHANT_NAME`, `SENDGRID_API_KEY`, `ADMIN_EMAIL`, and `SENDER_EMAIL` as environment variables.
