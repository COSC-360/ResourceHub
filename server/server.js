import app from "./app.js";
import { connectDB } from "./db.js";

async function startServer() {
  await connectDB();
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

startServer();
