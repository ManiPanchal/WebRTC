import React from "react";
import io from "socket.io-client";
const SocketContext = React.createContext();
export const useSocket = () => React.useContext(SocketContext);
export const SocketProvider = (props) => {
    const socket = io.connect("http://localhost:8000");
    return (
        <SocketContext.Provider value={{ socket }}>
            {props.children}
        </SocketContext.Provider>
    );
};
