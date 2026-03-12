import { Router } from 'express';
import * as courseController from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const courseRoutes = Router();

courseRoutes.post('/', courseController.create);