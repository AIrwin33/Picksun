import {io} from "socket.io-client";
import React, {useEffect, useState, useCallback, useMemo, createContext, useContext} from "react";


const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

export const socket = io(URL,{
  'connect timeout': 2000,
  'reconnection': true,
  'max reconnection attempts': 10000,
  'reconnectionDelay': 10,
  'reconnectionDelayMax': 500,
} );

export const SocketContext = React.createContext({
  socket: socket
});
