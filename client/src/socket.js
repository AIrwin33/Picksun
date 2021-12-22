import {io} from "socket.io-client";
import React from "react"

export const socket = io({
  'connect timeout': 1000,
  'reconnect': true,
  'reconnection delay': 300,
  'max reconnection attempts': 10000,
  'force new connection':true
  });
export const SocketContext = React.createContext(null);
