import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./Contexts/AuthContext.jsx";
import { ChatProvider } from "./Contexts/ChatContext";
import { ThemeProvider } from "./Contexts/ThemeContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <ChatProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </ChatProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
