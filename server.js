const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle form submission
app.post('/submit-order', (req, res) => {
  const order = {
    name: req.body.name,
    email: req.body.email,
    description: req.body.description,
    price: req.body.price,
    paymentMethod: req.body.paymentMethod,
    submittedAt: new Date().toISOString()
  };

  // Save the order to a file (or a database in a real application)
  const ordersFilePath = path.join(__dirname, 'orders.json');
  let orders = [];

  if (fs.existsSync(ordersFilePath)) {
    orders = JSON.parse(fs.readFileSync(ordersFilePath));
  }

  orders.push(order);
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));

  res.send('Order submitted successfully!');
});

// Route to display submitted orders (hidden admin page)
app.get('/admin/orders', (req, res) => {
  const ordersFilePath = path.join(__dirname, 'orders.json');
  let orders = [];

  if (fs.existsSync(ordersFilePath)) {
    orders = JSON.parse(fs.readFileSync(ordersFilePath));
  }

  res.json(orders);
});

// Serve the Astro built files
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
