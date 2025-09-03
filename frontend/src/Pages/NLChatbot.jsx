import React, { useState, useRef, useEffect } from "react";
import NLSidebar from "../Components/NLSidebar";
import Chatquery from "../Components/Chatquery";
import { Link } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const api = import.meta.env.VITE_AI_URL;

const sendMessage = async (question) => {
  const res = await axios.post(api, { question });
  return res.data.answer;
};

const NLChatbot = () => {
  const { user, isLoggedIn } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState("");
  const bottomRef = useRef(null);

  const chatMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (response) => {
      const updatedChats = chats.map((chat) =>
        chat === selectedChat
          ? {
              ...chat,
              messages: chat.messages.map((m, i) =>
                i === chat.messages.length - 1 ? { ...m, response } : m
              ),
            }
          : chat
      );
      setChats(updatedChats);

      setSelectedChat((prev) => ({
        ...prev,
        messages: prev.messages.map((m, i) =>
          i === prev.messages.length - 1 ? { ...m, response } : m
        ),
      }));
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const handleUploadClick = () => {
    if (messages.trim() === "" || !selectedChat) return;

    const newMessage = { query: messages, response: null };

    if (selectedChat.title === "New Chat") {
      const newChat = {
        id: Date.now(),
        title: "Fresh Chat",
        messages: [newMessage],
      };
      setChats([...chats, newChat]);
      setSelectedChat(newChat);
    } else {
      const updatedChats = chats.map((chat) =>
        chat === selectedChat
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      );
      setChats(updatedChats);
      setSelectedChat({
        ...selectedChat,
        messages: [...selectedChat.messages, newMessage],
      });
    }

    chatMutation.mutate(messages);
    setMessages("");
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-300 dark:border-gray-700 h-full flex-shrink-0">
        <NLSidebar
          chats={chats}
          setChats={setChats}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <h1 className="text-xl font-semibold tracking-wide">ELECTRON</h1>

          {isLoggedIn ? (
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-400 text-white font-semibold">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user?.username?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Login
            </Link>
          )}
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
          {!selectedChat || selectedChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <h2 className="text-4xl font-bold font-sans text-gray-400 dark:text-white select-none">
                Ask Anything
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg text-sm">
                Start a conversation by typing your question below. I’ll do my
                best to help!
              </p>
            </div>
          ) : (
            <>
              {selectedChat.messages.map((chat, index) => (
                <Chatquery
                  key={index}
                  query={chat.query}
                  response={chat.response}
                  isLoading={
                    chatMutation.isPending &&
                    index === selectedChat.messages.length - 1
                  }
                />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={messages}
              onChange={(e) => setMessages(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUploadClick();
                }
              }}
              placeholder="Type a message..."
              className="flex-grow px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none text-sm"
            />
            <button onClick={handleUploadClick}>
              <img
                src="/assets/icons/Upload Circle.png"
                alt="Send"
                className="w-7 h-7 cursor-pointer"
              />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NLChatbot;
