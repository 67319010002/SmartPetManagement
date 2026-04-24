import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import petRoutes from './routes/pet.routes';
import appointmentRoutes from './routes/appointment.routes';
import medicalRoutes from './routes/medical.routes';
import uploadRoutes from './routes/upload.routes';
import { errorHandler, notFound } from './middleware/error.middleware';

// โหลด Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ===========================
// Security & Parsing Middleware
// ===========================
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001'
      ];
      
      // Allow if it's in the allowed list or if it's a Vercel preview URL
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// Health Check
// ===========================
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'SmartPetManagement API is running 🐾',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ===========================
// API Routes
// ===========================
// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRoutes);
app.use('/api/upload', uploadRoutes);

// ===========================
// Error Handling
// ===========================
app.use(notFound);
app.use(errorHandler);

// ===========================
// Start Server
// ===========================
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🐾 SmartPetManagement API`);
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📋 Health: http://localhost:${PORT}/health\n`);
  });
}

export default app;
