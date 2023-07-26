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
  
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute('INSERT INTO User (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
      connection.release();
  
      res.status(201).json({ id: result.insertId, name, email });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read all users (accessible to Super Admin)
userRouter.get('/', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Admin' && role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Admin and Super Admin can read all users.' });
    }
  
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT id, name, email FROM User');
      connection.release();
  
      res.json(rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read a single user by ID (accessible to Super Admin and the user itself)
userRouter.get('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Admin' && role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Admin and Super Admin can read a user.' });
    }
  
    const { id } = req.params;
  
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT id, name, email FROM User WHERE id = ?', [id]);
      connection.release();
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a user by ID (accessible to Super Admin and the user itself)
userRouter.put('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Admin' && role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Admin and Super Admin can update a user.' });
    }
  
    const { id } = req.params;
    const { name, email } = req.body;
  
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute('UPDATE User SET name = ?, email = ? WHERE id = ?', [name, email, id]);
      connection.release();
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a user by ID (accessible to Super Admin only)
userRouter.delete('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Super Admin can delete a user.' });
    }
  
    const { id } = req.params;
  
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute('DELETE FROM User WHERE id = ?', [id]);
      connection.release();
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default userRouter;
