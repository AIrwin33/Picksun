import {io} from "socket.io-client";
import React from "react";
import { v4 as uuidv4 } from 'uuid';

export const socket = io({
    query: {conid:uuidv4()}
  // },
  // 'connect timeout': 150000,
  // 'reconnection': true,
  // 'max reconnection attempts': 10000,
});

export const SocketContext = React.createContext(null);
