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

    const query = ('INSERT INTO Feed (title, content) VALUES (?, ?)', [title, content]);

  // Execute the query
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error creating feeds:', err);
        res.status(500).json({ message: 'Error creating feeds.' });
      } else {
        res.json(rows);
      }
    });
});

// Read all feeds (accessible to Super Admin)
feedRouter.get('/', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Admin' && role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Admin and Super Admin can read all feeds.' });
    }

    const query = ('SELECT id, title, content FROM Feed');

  // Execute the query
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error fetching feeds:', err);
        res.status(500).json({ message: 'Error fetching feeds.' });
      } else {
        res.json(rows);
      }
    });
});

// Read a single feed by ID (accessible to Super Admin and Admins with access)
feedRouter.get('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Admin' && role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Admin and Super Admin can read a feed.' });
    }
  
    const { id } = req.params;

    const query = ('SELECT id, title, content FROM Feed WHERE id = ?', [id]);

  // Execute the query
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error fetching feeds by id', err);
        res.status(500).json({ message: 'Error fetching feeds.' });
      } else {
        res.json(rows);
      }
    });
});

// Update a feed by ID (accessible to Super Admin only)
feedRouter.put('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Super Admin can update feeds.' });
    }
  
    const { id } = req.params;
    const { title, content } = req.body;

    const query = ('UPDATE Feed SET title = ?, content = ? WHERE id = ?', [title, content, id]);

  // Execute the query
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error updating feeds by id', err);
        res.status(500).json({ message: 'Error updating feeds.' });
      } else {
        res.json(rows);
      }
    });

});

// Delete a feed by ID (accessible to Super Admin only)
feedRouter.delete('/:id', authenticateJWT, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access forbidden. Only Super Admin can delete feeds.' });
    }
  
    const { id } = req.params;
  
      const connection = await pool.getConnection();
  
      // Check if the feed exists
      const [rows] = await connection.query('SELECT * FROM Feed WHERE id = ?', [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Feed not found' });
      }
  
      // Check if any admin has access to delete the feed
      const [admins] = await connection.query('SELECT id FROM User WHERE role = ?', ['Admin']);
  
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

    const query = ('DELETE FROM Feed WHERE id = ?', [id]);

  // Execute the query
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error deleting feeds by id', err);
        res.status(500).json({ message: 'Error deleting feeds.' });
      } else {
        res.json(rows);
      }
    });
  });

export default feedRouter;
