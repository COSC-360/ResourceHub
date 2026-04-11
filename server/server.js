import http from "http";
import app from "./app.js";
import { connectDB } from "./db.js";
import { initSocket } from "./socket.js";
import { bootstrapAdminUsers } from "./utils/bootstrapAdminUsers.js";

const port = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectDB();
  await bootstrapAdminUsers();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
