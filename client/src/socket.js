import {io} from "socket.io-client";
import React from "react";
import { v4 as uuidv4 } from 'uuid';

export const socket = io({
  'connect timeout': 150000,
  'reconnection': true,
  'max reconnection attempts': 10000,
  

  },
  query: {
    {"foo": "bar"}
  });

  // io.engine.generateId = req => {
//     console.log('generate id');
//     return uuid.v4();
// );
export const SocketContext = React.createContext(null);
