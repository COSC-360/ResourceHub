import http from "http";
import app from "./app.js";
import { connectDB } from "./db.js";
import { initSocket } from "./socket.js";

async function startServer() {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

startServer();
