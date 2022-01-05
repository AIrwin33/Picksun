import {io} from "socket.io-client";
import React from "react"

export const socket = io({
  'connect timeout': 150000,
  'reconnect': true,
  'reconnection delay': 300,
  'max reconnection attempts': 10000
  });
export const SocketContext = React.createContext(null);
