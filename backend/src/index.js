import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import {
  initializeSupabaseClient,
  testSupabaseConnection,
} from './config/supabaseClient.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the System Development Backend API' });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Global middleware - must be last
app.use(notFoundHandler);
app.use(errorHandler);
const startServer = async () => {
  try {
    // Initialize Supabase REST API client (works over HTTP)
    initializeSupabaseClient();
    await testSupabaseConnection();

    // Try to initialize Sequelize (may fail if DNS blocks it)
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};
startServer();
