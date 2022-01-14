import {io} from "socket.io-client";
import React from "react";
const { v4: uuidv4 } = require('uuid');

export const socket = io({
  'connect timeout': 150000,
  'reconnection': true,
  'max reconnection attempts': 10000,
  

  },
  {param:uuid.v4()});

  // io.engine.generateId = req => {
//     console.log('generate id');
//     return uuid.v4();
// );
export const SocketContext = React.createContext(null);
