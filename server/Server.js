import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Route imports
import userRoutes from './routes/userRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Allowed origins: local dev + live deployed frontend
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL,   // Set this to your Vercel frontend URL in production
].filter(Boolean); // Remove undefined if CLIENT_URL is not set

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. Postman, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static mapping for uploaded images (works in local dev)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/user', userRoutes);
app.use('/organizer', organizerRoutes);
app.use('/admin', adminRoutes);

// Health check route — to verify backend is running
app.get('/', (req, res) => {
    res.json({ message: 'सफलDarshan API is running!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
