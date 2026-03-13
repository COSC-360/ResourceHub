import express from "express";
import cors from "cors";
import { userRoutes } from "./routes/userRoutes.js";
import { connectDB, getDB } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);

async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    console.warn("Could not connect to MongoDB:", error.message);
    console.log("Server starting without database connection...");
  }

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

startServer();
