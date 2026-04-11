import { io } from "socket.io-client";

export const socket = io("/", {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Client socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Client socket disconnected");
});