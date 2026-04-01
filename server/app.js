import express from "express";
import cors from "cors";
import { userRoutes } from "./routes/userRoutes.js";
import { courseRoutes } from "./routes/courseRoutes.js";
import { discussionRoutes } from "./routes/discussionRoutes.js";
import { commonRoutes } from "./routes/commonRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/user", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/discussion", discussionRoutes);
app.use("/api/common", commonRoutes);

export default app;
