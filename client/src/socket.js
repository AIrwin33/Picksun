import {io} from "socket.io-client";
import React from "react"

export const socket = io({
  'connect timeout': 150000,
  'reconnection': true,
  'max reconnection attempts': 10000,
  });

  // io.engine.generateId = req => {
//     console.log('generate id');
//     return uuid.v4();
// );
export const SocketContext = React.createContext(null);
