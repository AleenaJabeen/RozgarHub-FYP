import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; // Must match your backend server port

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // We will connect manually only when a provider logs in
});

export default socket;