# Coinbase Commerce Payment Integration Example

This project is a demonstration of how to integrate Coinbase Commerce as a payment gateway into a Node.js web application. It includes a backend built with Express.js and a simple HTML/JavaScript frontend.

## Features

- **Create Payment Charges**: An endpoint to create a payment charge on Coinbase Commerce.
- **Webhook Verification**: An endpoint to securely receive and verify webhooks from Coinbase.
- **Network-Specific Logging**: The webhook handler checks if a payment was made on the **Base** network and logs it differently.
- **Simple Frontend**: A basic HTML page with a "Buy Now" button to initiate the payment flow.
- **Configuration-First**: Uses environment variables for API keys and secrets for better security.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- `npm` (usually comes with Node.js)
- A [Coinbase Commerce](https://commerce.coinbase.com/) account

## Setup Instructions

1.  **Clone the repository or download the code.**

2.  **Install dependencies:**
    Open your terminal in the project root and run:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    a. Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    b. Edit the `.env` file with your credentials:

    -   `COINBASE_API_KEY`: You can get this from your Coinbase Commerce account under **Settings > API Keys > New API Key**.
    -   `COINBASE_WEBHOOK_SECRET`: This is obtained when you set up a webhook endpoint. See the "Testing Webhooks" section below.

## Running the Application

1.  **Start the backend server:**
    ```bash
    npm run server
    ```
    The server will start on `http://localhost:3001` by default.

2.  **Access the frontend:**
    Open your web browser and navigate to:
    [http://localhost:3001](http://localhost:3001)

    You should see the sample product page. Clicking the "Buy Now with Crypto" button will redirect you to the Coinbase checkout page.

## Testing Webhooks with `ngrok`

To test the webhook functionality locally, your server needs to be accessible from the public internet so Coinbase can send events to it. A tool like [ngrok](https://ngrok.com/) makes this easy.

1.  **Install and configure ngrok.**

2.  **Expose your local server:**
    While your server is running, open a new terminal window and run:
    ```bash
    ngrok http 3001
    ```

3.  **Get your public URL:**
    `ngrok` will give you a public URL (e.g., `https://<random-string>.ngrok.io`). Copy the `https` URL.

4.  **Create a webhook endpoint in Coinbase Commerce:**
    a. Go to your Coinbase Commerce dashboard.
    b. Navigate to **Settings > Webhooks > Add an endpoint**.
    c. Paste your `ngrok` URL and append the webhook path: `https://<random-string>.ngrok.io/api/webhook`.
    d. Click "Save". Coinbase will show you the **Webhook Signing Secret**.

5.  **Update your `.env` file:**
    Copy the webhook secret from Coinbase and paste it into your `.env` file for the `COINBASE_WEBHOOK_SECRET` variable.

6.  **Restart your server:**
    Stop your server (Ctrl+C) and restart it (`npm run server`) to load the new environment variable.

Now, when you complete a test payment, you will see the webhook events logged in your server's console, including the special message for payments made on the Base network.
