import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './config/database.js';
import {
  initializeSupabaseClient,
  testSupabaseConnection,
} from './config/supabaseClient.js';
import { initializeFineScheduler } from './jobs/fineScheduler.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import criminalRoutes from './routes/criminalRoutes.js';
import fineRoutes from './routes/fineRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import tipRoutes from './routes/tipRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// 🔍 Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`\n🌐 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, req.body);
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the System Development Backend API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/criminals', criminalRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tips', tipRoutes);

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

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server is running on http://0.0.0.0:${PORT}`);
      console.log(`✓ Access via: http://localhost:${PORT} or http://127.0.0.1:${PORT} or http://192.168.1.62:${PORT}`);
      
      // PEZY-414: Initialize fine scheduler
      initializeFineScheduler();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};
startServer();
