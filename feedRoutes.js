import express from 'express';
import pool from './db.js';
import authenticateJWT from './authMiddleware.js';

const feedRouter = express.Router();

// Create a new feed (accessible to Super Admin only)
feedRouter.post('/', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Super Admin can create feeds.' });
    }
  
    const { title, content } = req.body;
  
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute('INSERT INTO Feed (title, content) VALUES (?, ?)', [title, content]);
      connection.release();
  
      res.status(201).json({ id: result.insertId, title, content });
    } catch (error) {
      console.error('Error creating feed:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read all feeds (accessible to Super Admin)
feedRouter.get('/', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Admin' && role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Admin and Super Admin can read all feeds.' });
    }
  
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT id, title, content FROM Feed');
      connection.release();
  
      res.json(rows);
    } catch (error) {
      console.error('Error fetching feeds:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read a single feed by ID (accessible to Super Admin and Admins with access)
feedRouter.get('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Admin' && role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Admin and Super Admin can read a feed.' });
    }
  
    const { id } = req.params;
  
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT id, title, content FROM Feed WHERE id = ?', [id]);
      connection.release();
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Feed not found' });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching feed:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a feed by ID (accessible to Super Admin only)
feedRouter.put('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Super Admin can update feeds.' });
    }
  
    const { id } = req.params;
    const { title, content } = req.body;
  
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute('UPDATE Feed SET title = ?, content = ? WHERE id = ?', [title, content, id]);
      connection.release();
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Feed not found' });
      }
  
      res.json({ message: 'Feed updated successfully' });
    } catch (error) {
      console.error('Error updating feed:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a feed by ID (accessible to Super Admin only)
feedRouter.delete('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Super Admin can delete feeds.' });
    }
  
    const { id } = req.params;
  
    try {
      const connection = await pool.getConnection();
  
      // Check if the feed exists
      const [rows] = await connection.execute('SELECT * FROM Feed WHERE id = ?', [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Feed not found' });
      }
  
      // Check if any admin has access to delete the feed
      const [admins] = await connection.execute('SELECT id FROM User WHERE role = ?', ['Admin']);
  
      for (const admin of admins) {
        if (admin.id !== req.user.id) {
          // Super Admin should not be able to delete their own access on a feed
          const [permissions] = await connection.execute('SELECT * FROM Feed_Permissions WHERE feed_id = ? AND user_id = ? AND can_delete = 1', [id, admin.id]);
  
          if (permissions.length > 0) {
            return res.status(403).json({ error: 'Access forbidden. Only the assigned admin can delete the feed.' });
          }
        }
      }
  
      // Delete the feed
      const [result] = await connection.execute('DELETE FROM Feed WHERE id = ?', [id]);
      connection.release();
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Feed not found' });
      }
  
      res.json({ message: 'Feed deleted successfully' });
    } catch (error) {
      console.error('Error deleting feed:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default feedRouter;
