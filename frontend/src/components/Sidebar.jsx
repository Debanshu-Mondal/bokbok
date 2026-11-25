import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import PixelAvatar from "./PixelAvatar";

export default function Sidebar({ selectedUser, onSelectUser, chats, setChats }) {
    const { authUser, logout } = useAuth();
    const { socket, onlineUserIds } = useSocket();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const debounceRef = useRef(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await axiosInstance.get("/chats");
                setChats(res.data.chats);
            } catch {
                // leave chats empty, sidebar will just show the empty state
            } finally {
                setIsLoadingChats(false);
            }
        };
        fetchChats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            setChats((prev) => {
                const otherId =
                    message.sender_id === authUser.id ? message.receiver_id : message.sender_id;
                const existing = prev.find((c) => c.userId === otherId);
                const isOpen = selectedUser?.id === otherId;

                const updated = {
                    userId: otherId,
                    username: existing?.username || selectedUser?.username || "someone",
                    profile_pic: existing?.profile_pic ?? selectedUser?.profile_pic ?? null,
                    lastMessage: message.message,
                    lastMessageTime: message.createdAt,
                    unreadCount: isOpen ? 0 : (existing?.unreadCount || 0) + 1,
                };

                return [updated, ...prev.filter((c) => c.userId !== otherId)];
            });
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, selectedUser?.id]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await axiosInstance.get("/users/search", { params: { q: query.trim() } });
                setResults(res.data.users);
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const handleSelectSearchResult = (user) => {
        onSelectUser(user);
        setQuery("");
        setResults([]);
    };

    const handleSelectChat = (chat) => {
        onSelectUser({ id: chat.userId, username: chat.username, profile_pic: chat.profile_pic });
        setChats((prev) =>
            prev.map((c) => (c.userId === chat.userId ? { ...c, unreadCount: 0 } : c))
        );
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-me">
                <PixelAvatar seed={authUser.username} src={authUser.profile_pic} size={32} />
                <span className="sidebar-me-name">{authUser.username}</span>
                <button className="pixel-btn pixel-btn-ghost pixel-btn-sm" onClick={logout} title="log out">
                    exit
                </button>
            </div>

            <div className="sidebar-search">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="find a friend…"
                />
            </div>

            <div className="sidebar-list">
                {query.trim() ? (
                    <>
                        {isSearching && <p className="sidebar-hint">searching…</p>}
                        {!isSearching && results.length === 0 && (
                            <p className="sidebar-hint">no one found under that name</p>
                        )}
                        {results.map((user) => (
                            <button
                                key={user.id}
                                className="sidebar-item"
                                onClick={() => handleSelectSearchResult(user)}
                            >
                                <PixelAvatar
                                    seed={user.username}
                                    src={user.profile_pic}
                                    size={36}
                                    online={onlineUserIds.includes(String(user.id))}
                                />
                                <span className="sidebar-item-name">{user.username}</span>
                            </button>
                        ))}
                    </>
                ) : (
                    <>
                        {isLoadingChats && <p className="sidebar-hint">loading chats…</p>}
                        {!isLoadingChats && chats.length === 0 && (
                            <p className="sidebar-hint">no chats yet — search a friend above</p>
                        )}
                        {chats.map((chat) => (
                            <button
                                key={chat.userId}
                                className={`sidebar-item ${selectedUser?.id === chat.userId ? "sidebar-item-active" : ""}`}
                                onClick={() => handleSelectChat(chat)}
                            >
                                <PixelAvatar
                                    seed={chat.username}
                                    src={chat.profile_pic}
                                    size={36}
                                    online={onlineUserIds.includes(String(chat.userId))}
                                />
                                <span className="sidebar-item-text">
                                    <span className="sidebar-item-name">{chat.username}</span>
                                    <span className="sidebar-item-preview">{chat.lastMessage}</span>
                                </span>
                                {chat.unreadCount > 0 && (
                                    <span className="sidebar-item-badge">{chat.unreadCount}</span>
                                )}
                            </button>
                        ))}
                    </>
                )}
            </div>
        </aside>
    );
}
