import express from 'express';
import router from './routes/index';
import sequelize from './config/database';

const app = express();
app.use(express.json());
app.use('/api', router);

// Sync database
sequelize.sync().then(() => console.log('Database connected'));

export default app;
