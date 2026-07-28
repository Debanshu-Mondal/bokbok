import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import PixelAvatar from "./PixelAvatar";
import MessageInput from "./MessageInput";
import PixelLoader from "./PixelLoader";

function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatContainer({ selectedUser, onNewestMessage, onBack }) {
    const { authUser } = useAuth();
    const { socket, onlineUserIds } = useSocket();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setMessages([]);

        const fetchMessages = async () => {
            try {
                const res = await axiosInstance.get(`/messages/${selectedUser.id}`);
                if (!cancelled) setMessages(res.data.messages);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        fetchMessages();

        return () => {
            cancelled = true;
        };
    }, [selectedUser.id]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            const isForThisThread =
                message.sender_id === selectedUser.id || message.receiver_id === selectedUser.id;
            if (!isForThisThread) return;
            setMessages((prev) => [...prev, message]);
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [socket, selectedUser.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (text) => {
        const res = await axiosInstance.post("/messages", {
            receiver_id: selectedUser.id,
            message: text,
        });
        setMessages((prev) => [...prev, res.data.data]);
        onNewestMessage?.(res.data.data);
    };

    const isOnline = onlineUserIds.includes(String(selectedUser.id));

    return (
        <section className="chat-container">
            <header className="chat-header">
                <button type="button" className="pixel-btn pixel-btn-ghost pixel-btn-sm chat-back-btn" onClick={onBack}>
                    &lt;
                </button>
                <PixelAvatar
                    seed={selectedUser.username}
                    src={selectedUser.profile_pic}
                    size={34}
                    online={isOnline}
                />
                <div>
                    <p className="chat-header-name">{selectedUser.username}</p>
                    <p className="chat-header-status">{isOnline ? "online" : "offline"}</p>
                </div>
            </header>

            <div className="chat-messages">
                {isLoading && <PixelLoader label="fetching clucks" />}

                {!isLoading && messages.length === 0 && (
                    <p className="chat-empty-hint">no messages yet — say hi!</p>
                )}

                {!isLoading &&
                    messages.map((msg) => {
                        const isMine = msg.sender_id === authUser.id;
                        return (
                            <div key={msg.id} className={`chat-bubble-row ${isMine ? "mine" : "theirs"}`}>
                                <div className="chat-bubble">
                                    <p>{msg.message}</p>
                                    <span className="chat-bubble-time">{formatTime(msg.createdAt)}</span>
                                </div>
                            </div>
                        );
                    })}
                <div ref={bottomRef} />
            </div>

            <MessageInput onSend={handleSend} />
        </section>
    );
}
