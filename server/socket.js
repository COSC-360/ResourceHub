import { Server } from "socket.io";

let io;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:4000";

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: clientOrigin,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinCourse", (courseId) => {
      if (!courseId) return;
      console.log("joinCourse:", courseId);
      socket.join(`course:${courseId}`);
    });

    socket.on("leaveCourse", (courseId) => {
      if (!courseId) return;
      console.log("leaveCourse:", courseId);
      socket.leave(`course:${courseId}`);
    });

    socket.on("joinDiscussion", (discussionId) => {
      if (!discussionId) return;
      console.log("joinDiscussion:", discussionId);
      socket.join(`discussion:${discussionId}`);
    });

    socket.on("leaveDiscussion", (discussionId) => {
      if (!discussionId) return;
      console.log("leaveDiscussion:", discussionId);
      socket.leave(`discussion:${discussionId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

    socket.on("joinCoursesLobby", () => {
        console.log("joinCoursesLobby");
    socket.join("courses:lobby");
    });

    socket.on("leaveCoursesLobby", () => {
        console.log("leaveCoursesLobby");
    socket.leave("courses:lobby");
    });
    
    socket.on("joinDiscussionsLobby", () => {
    console.log("joinDiscussionsLobby");
    socket.join("discussions:lobby");
    });

    socket.on("leaveDiscussionsLobby", () => {
    console.log("leaveDiscussionsLobby");
    socket.leave("discussions:lobby");
    });

    socket.on("joinUserSession", (userId) => {
      if (!userId) return;
      socket.join(`user:${String(userId)}`);
    });

    socket.on("leaveUserSession", (userId) => {
      if (!userId) return;
      socket.leave(`user:${String(userId)}`);
    });
    });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}