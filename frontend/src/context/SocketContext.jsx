import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

// Same-origin in production (frontend is served by the backend). In dev,
// point straight at the backend since Vite's dev server runs separately.
const SOCKET_URL = import.meta.env.DEV ? "http://localhost:3000" : undefined;

export function SocketProvider({ children }) {
    const { authUser } = useAuth();
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!authUser) {
            setSocket(null);
            setOnlineUserIds([]);
            return;
        }

        const token = localStorage.getItem("bokbok_token");
        const newSocket = io(SOCKET_URL, {
            auth: { token },
        });

        newSocket.on("getOnlineUsers", (ids) => {
            setOnlineUserIds(ids.map(String));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser?.id]);

    return (
        <SocketContext.Provider value={{ socket, onlineUserIds }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used within SocketProvider");
    return ctx;
}
