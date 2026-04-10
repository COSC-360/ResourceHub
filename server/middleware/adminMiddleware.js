import { verifyAccessToken } from "./authMiddleware.js";
import * as userRepository from "../repositories/userRepository.js";

export async function requireAdmin(req, res, next) {
  verifyAccessToken(req, res, async () => {
    try {
      const tokenAdmin = Boolean(req.user?.admin);
      const userId = req.user?.id ?? req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!tokenAdmin) {
        res.status(403).json({ error: "Admin access required" });
        return;
      }

      const userProfile = await userRepository.getUserById(userId);
      if (!userProfile) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!userProfile.isAdmin) {
        res.status(403).json({ error: "Admin access required" });
        return;
      }

      req.userId = userId;
      req.admin = true;
      req.user = {
        ...req.user,
        admin: true,
      };

      next();
    } catch (error) {
      res.status(500).json({ error: "Unable to verify admin permissions" });
    }
  });
}
