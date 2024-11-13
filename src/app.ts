import express from 'express';
import sequelize from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler.middleware';
import path from 'path';
import cors from 'cors';
// import routes
import {route as authRoutes} from './routes/auth.route'
import {route as userRoutes} from './routes/user.route'
import {route as memoryRoutes} from './routes/memory.route'
import {route as uploadRoutes} from './routes/upload.route'
import {route as profileRoutes} from './routes/profile.route'
// Import setupAssociations
import setupAssociations from './models/associations';

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // to let the front-end access the api

// Serve static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Setup database and associations
const initializeDatabase = async () => {
  try {
    // Set up model associations
    setupAssociations(); //! setup model associations should be always done at this point
    
    // Sync database
    await sequelize.sync();
    console.log('Database connected and models synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit process with failure
  }
};

// Initialize database
initializeDatabase();

// routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/memory', memoryRoutes); 
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;