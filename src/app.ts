import express from 'express';
import sequelize from './config/database';
import { errorHandler, notFound } from './middleware/handleErrors.middleware';

const app = express();
app.use(express.json());
// import routes
import {route as authRoutes} from './routes/auth.route'

// auth routes
app.use('/api/auth', authRoutes);


// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Sync database
sequelize.sync().then(() => console.log('Database connected'));

export default app;
