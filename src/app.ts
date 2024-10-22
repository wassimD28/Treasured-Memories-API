import express from 'express';
import sequelize from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler.middleware';
import path from 'path';
// import routes
import {route as authRoutes} from './routes/auth.route'
import {route as userRoutes} from './routes/user.route'
import {route as memoryRoutes} from './routes/memory.route'
import {route as uploadRoutes} from './routes/upload.route'

const app = express();
app.use(express.json());
// Serve static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/memory', memoryRoutes); 
app.use('/api/upload', uploadRoutes); // Separate route for uploading images

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Sync database
sequelize.sync().then(() => console.log('Database connected'));

export default app;
