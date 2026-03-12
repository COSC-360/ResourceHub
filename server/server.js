import express from "express";
import cors from "cors";
import { userRoutes } from "./routes/userRoutes.js";
import { courseRoutes } from "./routes/courseRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/courses", courseRoutes);

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});