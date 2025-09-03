import Chatbot from "./Pages/Chatbot";
import Error404 from "./Pages/Error404";
import Login from "./Pages/Login";
import NLChatbot from "./Pages/NLChatbot";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./Contexts/AuthContext";


function App() {
  const { isLoggedIn } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Chatbot /> : <NLChatbot />} />
        <Route
          path="/chatbot"
          element={isLoggedIn ? <Chatbot /> : <Navigate to="/" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
