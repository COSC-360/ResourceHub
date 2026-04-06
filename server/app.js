import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { userRoutes } from "./routes/userRoutes.js";
import { courseRoutes } from "./routes/courseRoutes.js";
import { discussionRoutes } from "./routes/discussionRoutes.js";
import { commonRoutes } from "./routes/commonRoutes.js";
import { voteRoutes } from "./routes/voteRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use((req, res, next) => {
  if (req.headers["Content-Type"]?.includes("multipart/form-data")) {
    next();
  } else {
    express.json({ limit: "10mb" })(req, res, next);
  }
});
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/user", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/discussion", discussionRoutes);
app.use("/api/common", commonRoutes);
app.use("/api/vote", voteRoutes);

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

export default app;
