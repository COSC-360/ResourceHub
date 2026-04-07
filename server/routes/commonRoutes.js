import { Router } from "express";
import * as commonController from "../controllers/commonController.js";
import { decodeAccessToken } from "../middleware/authMiddleware.js";

export const commonRoutes = Router();

commonRoutes.get("/search", commonController.search);
commonRoutes.get("/feed", decodeAccessToken, commonController.feed);