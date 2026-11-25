import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

export default function ChatPage() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [chats, setChats] = useState([]);

    return (
        <div className="chat-screen">
            <div className="pixel-panel chat-window">
                <div className="pixel-titlebar">
                    <span className="pixel-titlebar-dot" />
                    <span className="pixel-titlebar-dot" />
                    <span className="pixel-titlebar-dot" />
                    <span className="pixel-titlebar-label">bokbok://chat</span>
                </div>

                <div className="chat-window-body">
                    <Sidebar
                        selectedUser={selectedUser}
                        onSelectUser={setSelectedUser}
                        chats={chats}
                        setChats={setChats}
                    />
                    {selectedUser ? (
                        <ChatContainer
                            selectedUser={selectedUser}
                            onBack={() => setSelectedUser(null)}
                            onNewestMessage={(msg) => {
                                setChats((prev) => {
                                    const otherId = selectedUser.id;
                                    const rest = prev.filter((c) => c.userId !== otherId);
                                    return [
                                        {
                                            userId: otherId,
                                            username: selectedUser.username,
                                            profile_pic: selectedUser.profile_pic,
                                            lastMessage: msg.message,
                                            lastMessageTime: msg.createdAt,
                                            unreadCount: 0,
                                        },
                                        ...rest,
                                    ];
                                });
                            }}
                        />
                    ) : (
                        <NoChatSelected />
                    )}
                </div>
            </div>
        </div>
    );
}
