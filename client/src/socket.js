import {io} from "socket.io-client";
import React from "react"

export const socket = io.connect("http://cryptic-citadel-94967.herokuapp.com/", { transports: ['websocket'] });
export const SocketContext = React.createContext(null);
