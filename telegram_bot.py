import requests
import json

BOT_TOKEN = "8324622055:AAFZqSE3tCoZ123OszT1f67Xj51mj1XP-pE"
CHAT_ID = "1088578511"

def send_telegram_photo(caption, photo_path):
    """Sends a photo with a caption to the specified Telegram chat."""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"
    files = {'photo': open(photo_path, 'rb')}
    data = {"chat_id": CHAT_ID, "caption": caption, "parse_mode": "Markdown"}
    try:
        response = requests.post(url, files=files, data=data)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error sending Telegram photo: {e}")
    finally:
        files['photo'].close()

def main():
    """Reads product data and sends it to Telegram with images."""
    try:
        with open("retail_website_data.json", "r") as f:
            data = json.load(f)
            products = data.get("products", [])

        if not products:
            # This part will now need to be a simple text message as there are no products.
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            payload = {"chat_id": CHAT_ID, "text": "No products found."}
            requests.post(url, json=payload)
            return

        for product in products:
            if product.get("images"):
                image_path = f"Images/{product['images'][0]}"
                caption = f"""
*Name:* {product.get('name', 'N/A')}
*Puffs:* {product.get('puffs', 'N/A')}
*Price:* ₹{product.get('sale_price', 'N/A')}
                """
                send_telegram_photo(caption.strip(), image_path)

    except FileNotFoundError:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {"chat_id": CHAT_ID, "text": "Error: retail_website_data.json not found."}
        requests.post(url, json=payload)
    except json.JSONDecodeError:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {"chat_id": CHAT_ID, "text": "Error: Could not decode retail_website_data.json."}
        requests.post(url, json=payload)

if __name__ == "__main__":
    main()