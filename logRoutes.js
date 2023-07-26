import express from 'express';
import fs from 'fs';
import path from 'path';
import authenticateJWT from './authMiddleware.js';

const logRouter = express.Router();
const logDirectory = './logs';

// Read the log file (accessible to Super Admin only)
logRouter.get('/', authenticateJWT, async (req, res) => {
  const logFilePath = path.join(logDirectory, 'api_logs.txt');

  // Read the log file content and send it as a response
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read log file.' });
    }

    res.status(200).send(data);
  });
});

export default logRouter;
