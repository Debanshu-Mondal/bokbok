import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import PixelLoader from "./components/PixelLoader";

function App() {
    const { authUser, isCheckingAuth } = useAuth();

    if (isCheckingAuth) {
        return (
            <div className="boot-screen">
                <PixelLoader label="starting the chatter" />
            </div>
        );
    }

    return (
        <SocketProvider>
            <Routes>
                <Route
                    path="/"
                    element={authUser ? <ChatPage /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/login"
                    element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
                />
                <Route
                    path="/signup"
                    element={!authUser ? <SignupPage /> : <Navigate to="/" replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </SocketProvider>
    );
}

export default App;
