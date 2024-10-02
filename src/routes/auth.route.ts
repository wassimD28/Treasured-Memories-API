import { Router } from 'express';
import { handleValidations } from '../middleware/handleValidations.middleware';
import { registerValidation } from '../validations/register.validation';
import { loginController, logoutController, refreshTokenController, registerController } from '../controllers/auth.controller';
import { loginValidation } from '../validations/login.validation';
import { authenticateToken } from '../middleware/authenticateToken.middleware';

const route = Router();

// register
route.post("/register", registerValidation, handleValidations, registerController);

// login
route.post("/login", loginValidation, handleValidations, loginController);

// logout
route.post("/logout", authenticateToken, logoutController);

// refresh token
route.post("/token/refresh", refreshTokenController);

export {route};
