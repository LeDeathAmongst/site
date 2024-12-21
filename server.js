const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/submit-order', (req, res) => {
  const { name, email, description, price, paymentMethod } = req.body;
  const orderId = uuidv4();
  const submittedAt = new Date().toISOString();

  const orderContent = `---
id: "${orderId}"
name: "${name}"
email: "${email}"
description: "${description}"
price: ${price}
paymentMethod: "${paymentMethod}"
submittedAt: "${submittedAt}"
---

Order details:
- Name: ${name}
- Email: ${email}
- Description: ${description}
- Price: ${price}
- Payment Method: ${paymentMethod}
`;

  const orderFilePath = path.join(__dirname, 'src/content/orders', `${orderId}.md`);
  fs.writeFile(orderFilePath, orderContent, (err) => {
    if (err) {
      console.error('Error saving order:', err);
      return res.status(500).send('Error saving order');
    }
    res.redirect('/order-confirmation');
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
