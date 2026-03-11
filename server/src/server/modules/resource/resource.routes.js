import { Router } from 'express';
import * as resourceController from './resource.controller.js';

export const resourceRoutes = Router();

resourceRoutes.get('/:id', resourceController.get);
resourceRoutes.post('/', resourceController.create);
resourceRoutes.put('/:id', resourceController.update);
resourceRoutes.delete('/:id', resourceController.remove);