import { useState } from "react";

export default function MessageInput({ onSend }) {
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || isSending) return;

        setIsSending(true);
        setText("");
        try {
            await onSend(trimmed);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form className="message-input" onSubmit={handleSubmit}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="peck out a message…"
                maxLength={2000}
            />
            <button type="submit" className="pixel-btn pixel-btn-primary" disabled={!text.trim() || isSending}>
                send
            </button>
        </form>
    );
}
