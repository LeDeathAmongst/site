import http from 'http';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';
import { URL } from 'url';
import { parse } from 'querystring';

const PORT = 3000;
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1319827706887671919/SqeSEkI0L_Kqlk0mRgH5dZvKtXgkuaks0_B9r2-yJgTiEI4bkPEI-D98ZMBlarv5mt2t';

const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  if (req.method === 'POST' && req.url === '/submit-order') {
    let body = '';

    // Accumulate the data chunks received in the request body
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // Once all data is received, process the order submission
    req.on('end', () => {
      try {
        const { name, email, description, price, paymentMethod } = parse(body);
        const orderId = uuidv4(); // Generate a unique order ID
        const submittedAt = new Date().toISOString(); // Record the submission time

        console.log(`Order received: ${orderId}`);

        // Prepare the message to be sent to the Discord webhook
        const webhookData = JSON.stringify({
          content: `New Order Received!\n\n**Order ID:** ${orderId}\n**Name:** ${name}\n**Email:** ${email}\n**Description:** ${description}\n**Price:** $${price}\n**Payment Method:** ${paymentMethod}\n**Submitted At:** ${submittedAt}`
        });

        const webhookUrl = new URL(DISCORD_WEBHOOK_URL);
        const webhookOptions = {
          hostname: webhookUrl.hostname,
          path: webhookUrl.pathname + webhookUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(webhookData)
          }
        };

        // Send the webhook message to Discord
        const webhookReq = https.request(webhookOptions, webhookRes => {
          let webhookResponse = '';

          webhookRes.on('data', chunk => {
            webhookResponse += chunk;
          });

          webhookRes.on('end', () => {
            console.log('Webhook response:', webhookResponse);
            res.writeHead(302, { 'Location': `/order-confirmation?orderId=${orderId}` });
            res.end();
          });
        });

        webhookReq.on('error', e => {
          console.error('Error sending webhook:', e);
          res.statusCode = 500;
          res.end('Error sending webhook');
        });

        webhookReq.write(webhookData); // Write the webhook data to the request
        webhookReq.end();
      } catch (error) {
        console.error('Error processing order:', error);
        res.statusCode = 500;
        res.end('Error processing order');
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/order-confirmation')) {
    const urlParts = new URL(req.url, `http://${req.headers.host}`);
    const orderId = urlParts.searchParams.get('orderId');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Rosie</title>
        <style>
          .confirmation-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
            background: #1a1a1a;
            border-radius: 8px;
            color: #fff;
            margin: 2rem auto;
            max-width: 600px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .confirmation-container h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          .confirmation-container p {
            font-size: 1.2rem;
            margin-bottom: 1rem;
          }
          .order-number {
            font-weight: bold;
            font-size: 1.5rem;
            margin-bottom: 2rem;
          }
          .home-link {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #007bff;
            color: white;
            border-radius: 4px;
            text-decoration: none;
            transition: background-color 0.3s ease;
          }
          .home-link:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="confirmation-container">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order! Your order has been submitted successfully. We will process it soon.</p>
          <p class="order-number">Order Number: ${orderId}</p>
          <a href="https://site.prismbot.icu" class="home-link">Back to Home</a>
        </div>
      </body>
      </html>
    `);
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
