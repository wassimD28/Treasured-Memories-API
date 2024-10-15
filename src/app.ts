import express from 'express';
import sequelize from './config/database';
import { errorHandler, notFound } from './middleware/handleErrors.middleware';

const app = express();
app.use(express.json());
// import routes
import {route as authRoutes} from './routes/auth.route'
import {route as userRoutes} from './routes/user.route'

// routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Sync database
sequelize.sync().then(() => console.log('Database connected'));

export default app;
