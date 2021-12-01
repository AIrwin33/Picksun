import {io} from "socket.io-client";
import React from "react"

export const socket = io({
    'reconnection': true,
    'reconnectionDelay': 500,
    'reconnectionAttempts': 10
  });
export const SocketContext = React.createContext(null);
