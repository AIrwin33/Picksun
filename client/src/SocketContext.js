import { createContext, useContext, useState, useEffect } from "react";

const SocketContext = createContext({
  socket: undefined
});

const URL = process.env.NODE_ENV === 'production' ? 'https://cryptic-citadel-94967.herokuapp.com' : 'http://localhost:3000';

export const SocketProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);

  
};

export default SocketContext;