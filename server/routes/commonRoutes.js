import { Router } from "express"
import * as commonController from "../controllers/commonController.js"

export const commonRoutes = Router();

commonRoutes.get("/search", commonController.search);
