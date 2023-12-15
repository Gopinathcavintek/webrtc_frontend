import { createContext, useCallback, useContext, useMemo } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

const SocketProvider = (props) => {
  const socket = useMemo(() => {
    return io("https://stage-api.skillrobo.com");
  }, []);
  return (
    <SocketContext.Provider value={{ socket }}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
