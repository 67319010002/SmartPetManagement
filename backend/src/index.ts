import express, { Request, Response, NextFunction } from 'express';
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

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ==========================================
// 1. MUST BE FIRST: CORS & OPTIONS HANDLING
// ==========================================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors({
  origin: '*',
  credentials: false
}));

// ===========================
// 2. Security & Parsing
// ===========================
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// 3. Health Check
// ===========================
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'SmartPetManagement API is running 🐾',
    timestamp: new Date().toISOString(),
  });
});

// ===========================
// 4. API Routes
// ===========================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRoutes);
app.use('/api/upload', uploadRoutes);

// ===========================
// 5. Error Handling
// ===========================
app.use(notFound);
app.use(errorHandler);

// ===========================
// 6. Start Server
// ===========================
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🐾 SmartPetManagement API Ready`);
  });
}

export default app;
