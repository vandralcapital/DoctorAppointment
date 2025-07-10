console.log("Backend index.js loaded");
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import doctorRouter from './routes/doctor.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { sanitizeInput } from './middleware/validation.js';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS: allow all origins, no credentials for public API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting and input sanitization
app.use(generalLimiter);
app.use(sanitizeInput);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true, // deprecated
  // useUnifiedTopology: true, // deprecated
}).then(() => {
  console.log('✅ MongoDB Connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Simple test route
app.get('/', (req, res) => {
  res.send('Doctor Booking API Running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5050;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

// Example: Log when a client connects
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
});

// Export io for use in routes
export { io };

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
