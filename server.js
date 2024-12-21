import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { URL } from 'url';
import { parse } from 'querystring';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __filename and __dirname equivalent in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const ORDERS_FILE_PATH = path.join(__dirname, 'orders.json');

const server = http.createServer(async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  if (req.method === 'POST' && req.url === '/submit-order') {
    let body = '';

    // Accumulate the data chunks received in the request body
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // Once all data is received, process the order submission
    req.on('end', async () => {
      try {
        const { name, email, description, price, paymentMethod } = parse(body);
        const orderId = uuidv4(); // Generate a unique order ID
        const submittedAt = new Date().toISOString(); // Record the submission time

        console.log(`Order received: ${orderId}`);

        // Prepare the order details
        const orderDetails = {
          orderId,
          name,
          email,
          description,
          price,
          paymentMethod,
          submittedAt
        };

        // Read existing orders from the file
        let orders = [];
        try {
          const data = await fs.readFile(ORDERS_FILE_PATH, 'utf-8');
          orders = JSON.parse(data);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            throw err;
          }
        }

        // Add the new order to the list
        orders.push(orderDetails);

        // Write the updated orders back to the file
        await fs.writeFile(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2));

        // Redirect to order confirmation page with orderId as query parameter
        res.writeHead(302, { 'Location': `/order-confirmation?orderId=${orderId}` });
        res.end();
      } catch (error) {
        console.error('Error processing order:', error);
        res.statusCode = 500;
        res.end('Error processing order');
      }
    });
  } else if (req.method === 'GET' && req.url === '/admin-orders') {
    // Serve the admin orders page
    try {
      const data = await fs.readFile(ORDERS_FILE_PATH, 'utf-8');
      const orders = JSON.parse(data);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Orders - Rosie</title>
          <style>
            .orders-container {
              display: flex;
              flex-wrap: wrap;
              gap: 1rem;
              padding: 2rem;
            }
            .order-card {
              background: #1a1a1a;
              color: #fff;
              border-radius: 8px;
              padding: 1rem;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              max-width: 300px;
              flex: 1;
            }
            .order-card h2 {
              font-size: 1.5rem;
              margin-bottom: 0.5rem;
            }
            .order-card p {
              font-size: 1rem;
              margin-bottom: 0.5rem;
            }
          </style>
        </head>
        <body>
          <div class="orders-container">
            ${orders.map(order => `
              <div class="order-card">
                <h2>Order ID: ${order.orderId}</h2>
                <p><strong>Name:</strong> ${order.name}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Description:</strong> ${order.description}</p>
                <p><strong>Price:</strong> $${order.price}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p><strong>Submitted At:</strong> ${order.submittedAt}</p>
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error reading orders file:', error);
      res.statusCode = 500;
      res.end('Error reading orders file');
    }
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
