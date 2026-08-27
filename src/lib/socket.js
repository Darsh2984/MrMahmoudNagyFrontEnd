import { io } from "socket.io-client";

import {
  getToken,
} from "./storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:6000/api";

const SOCKET_URL = API_URL.replace(
  /\/api\/?$/,
  ""
);

export const socket = io(SOCKET_URL, {
  autoConnect: false,

  transports: [
    "websocket",
    "polling",
  ],
});

export async function connectSocket() {
  const token = await getToken();

  if (!token) {
    return false;
  }

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }

  return true;
}

export async function connectParentSocket(
  accessCode,
) {
  const normalizedCode =
    String(accessCode || "")
      .trim()
      .toUpperCase();

  if (!normalizedCode) {
    return false;
  }

  socket.auth = {
    parentAccessCode: normalizedCode,
  };

  if (!socket.connected) {
    socket.connect();
  }

  return true;
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}