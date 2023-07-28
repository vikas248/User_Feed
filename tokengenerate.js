import express from 'express'
import jwt from 'jsonwebtoken' 
const app = express();
const port = 4000;

import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const user = {
    email: "superadmin@gmail.com",
    password: "super@123"
  };

app.use(express.json());

function generateToken(user) {
    return jwt.sign({email: user.email, password:user.password }, JWT_SECRET, {
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
