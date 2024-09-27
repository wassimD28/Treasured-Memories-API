import { Router } from 'express';
import User from '../models/index';

const router = Router();

router.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

export default router;
