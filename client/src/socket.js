import {io} from "socket.io-client";
import React from "react"

export const socket = io({'forceNew':true});
export const SocketContext = React.createContext(null);
