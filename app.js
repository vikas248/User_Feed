// app.js

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pool from './db.js';
import userRouter from './userRoutes.js';
import feedRouter from './feedRoutes.js';
import logRouter from './logRoutes.js';
import authenticateJWT from './authMiddleware.js';
import logMiddleware from './logMiddleware.js';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Apply the logging middleware to all API requests
app.use(logMiddleware);

// Mount the routes
app.use('/users', userRouter);
app.use('/feeds', feedRouter);
app.use('/logs', logRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});






