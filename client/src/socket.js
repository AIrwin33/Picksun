import {io} from "socket.io-client";
import React from "react"

export const socket = io('http://cryptic-citadel-94967.herokuapp.com/');
export const SocketContext = React.createContext(null);
