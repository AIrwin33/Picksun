import { createContext, useContext, useState, useEffect } from "react";

const SocketContext = createContext({
  socket: undefined
});

const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

export const SocketProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket((URL,{
      'connect timeout': 2000,
      'reconnection': true,
      'max reconnection attempts': 10000,
      'reconnectionDelay': 10,
      'reconnectionDelayMax': 500,
    } ));
  }, []);

  useEffect(() => {

  }, [socket]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;