import express from 'express';
import dotenv from 'dotenv';
import coinbase from 'coinbase-commerce-node';
import bodyParser from 'body-parser';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Using 3001 to avoid conflict with Vite's default 3000

// Initialize Coinbase Commerce client
const { Client, resources, Webhook } = coinbase;
const { Charge } = resources;
const apiKey = process.env.COINBASE_API_KEY;
if (apiKey) {
    Client.init(apiKey);
} else {
    console.error('COINBASE_API_KEY is not set in the environment variables. Please create a .env file and add it.');
}

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware for parsing JSON bodies, but only for routes that need it
const jsonParser = express.json();

// A simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the backend server!' });
});

// Endpoint to create a charge
app.post('/api/create-charge', jsonParser, async (req, res) => {
    // In a real application, you would get product details and amount from the request body
    // For this example, we'll use fixed details.
    const chargeData = {
        name: 'Sample Product',
        description: 'This is a sample product purchase.',
        local_price: {
            amount: '1.00', // Example price
            currency: 'USD',
        },
        pricing_type: 'fixed_price',
        redirect_url: `http://localhost:${port}/confirmation.html`,
        cancel_url: `http://localhost:${port}/`,
        metadata: {
            // You can add any custom data here, like a user ID or order ID
            userId: 'user123',
            orderId: 'order456'
        },
        // Regarding currency priority (e.g., Base ETH/USDC):
        // The Coinbase Commerce API does not seem to support setting a default or recommended
        // payment currency via the API at the time of charge creation. This is typically managed
        // in your Coinbase Commerce account settings dashboard, where you can enable/disable
        // the cryptocurrencies you wish to accept. The hosted checkout page will then display
        // all enabled currencies to the customer.
    };

    try {
        const charge = await Charge.create(chargeData);
        console.log('Charge created successfully:', charge.id);
        res.json({ hosted_url: charge.hosted_url });
    } catch (error) {
        console.error('Failed to create charge:', error);
        res.status(500).json({ error: 'Failed to create charge' });
    }
});

// Webhook endpoint for Coinbase Commerce
// IMPORTANT: This route needs the raw body for signature verification, so it must come BEFORE express.json() middleware
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const signature = req.headers['x-cc-webhook-signature'];
    const rawBody = req.body;
    const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('COINBASE_WEBHOOK_SECRET is not set.');
        return res.status(500).send('Webhook secret is not configured.');
    }

    try {
        const event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
        console.log('Webhook event received and verified:', event.id);

        if (event.type === 'charge:confirmed') {
            console.log('Charge confirmed!');
            // In a real app, you would update the order status in your database
            const chargeData = event.data;

            // Check the network of the payment
            // Based on documentation, the `payments` array contains transaction details.
            // We assume the network is available in `payment.network`.
            // NOTE: The exact network identifier for Base might be 'base'. Please verify with a test payment.
            const payment = chargeData.payments && chargeData.payments[0];
            if (payment) {
                const network = payment.network;
                const cryptoAmount = `${payment.value.crypto.amount} ${payment.value.crypto.currency}`;

                if (network === 'base') {
                    console.log(`Payment of ${cryptoAmount} confirmed on Base network. Order ID: ${chargeData.metadata.orderId}`);
                    // Mark payment as a Base network payment
                } else {
                    console.log(`Payment of ${cryptoAmount} confirmed on another network: ${network}. Order ID: ${chargeData.metadata.orderId}`);
                }
            } else {
                console.log(`Charge ${chargeData.id} confirmed, but payment details were not available in the webhook.`);
            }
        } else {
            console.log(`Received unhandled event type: ${event.type}`);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error verifying webhook signature:', error.message);
        res.status(400).send('Webhook Error: ' + error.message);
    }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
