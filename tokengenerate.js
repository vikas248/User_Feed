const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const port = 4000;

const user = {
    id: "1",
    name: "ayush",
    role: "Super Admin",
    email: "ayush@gmail.com",
    password: "ayush@123"
  };

app.use(express.json());

function generateToken(user) {
    return jwt.sign({ id: user.id, name:user.name, role:user.role, email: user.email, password:user.password }, 'your-secret-key', {
      expiresIn: '1h', // Token expires in 1 hour
    });
  }

app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
  
    if (email !== user.email) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });