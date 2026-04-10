import { Router } from "express";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import * as adminAnalyticsController from "../controllers/adminAnalyticsController.js";

export const adminAnalyticsRoutes = Router();

adminAnalyticsRoutes.get("/week", requireAdmin, adminAnalyticsController.getLastWeek);
