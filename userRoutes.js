// userRoutes.js

import express from 'express';
import bcrypt from 'bcrypt';
import pool from './db.js';
import authenticateJWT from './authMiddleware.js';

const userRouter = express.Router();

// Create a new user (accessible to Super Admin only)
userRouter.post('/', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Super Admin can create users.' });
    }
  
    const { name, email, password } = req.body;

    const query = ('INSERT INTO User (name, email, password) VALUES (?, ?, ?)', [name, email, password]);

  // Execute the query
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error Creating users in MySQL:', err);
        res.status(500).json({ message: 'Error creating users.' });
      } else {
        res.json(rows);
      }
    });
});

// Read all users (accessible to Super Admin)
userRouter.get('/', authenticateJWT, async (req, res) => {
  const query = 'SELECT * FROM user1';

  // Execute the query
  pool.query(query, (err, rows) => {
    if (err) {
      console.error('Error fetching users from MySQL:', err);
      res.status(500).json({ message: 'Error fetching users.' });
    } else {
      res.json(rows);
    }
  });
});

// Read a single user by ID (accessible to Super Admin and the user itself)
userRouter.get('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Admin' && role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Admin and Super Admin can read a user.' });
    }
  
    const { id } = req.params;

    const query = ('SELECT id, name, email FROM User WHERE id = ?', [id]);

  // Execute the query
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error fetching users from MySQL:', err);
        res.status(404).json({ message: 'Internal Server Error' });
      } else {
        res.json(rows);
      }
    });
});

// Update a user by ID (accessible to Super Admin and the user itself)
userRouter.put('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Admin' && role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Admin and Super Admin can update a user.' });
    }
  
    const { id } = req.params;
    const { name, email } = req.body;

    const query = ('UPDATE User SET name = ?, email = ? WHERE id = ?', [name, email, id]);

  // Execute the query
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error updating users in MySQL:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(rows);
      }
    });
});

// Delete a user by ID (accessible to Super Admin only)
userRouter.delete('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Super Admin can delete a user.' });
    }
  
    const { id } = req.params;

    const query = ('DELETE FROM User WHERE id = ?', [id]);

  // Execute the query
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error Deleting users from MySQL:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(rows);
      }
    });
});

export default userRouter;
