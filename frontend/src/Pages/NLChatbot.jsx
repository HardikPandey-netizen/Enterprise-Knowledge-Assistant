import React, { useState } from "react";
import NLSidebar from "../Components/NLSidebar";
import Chatquery from "../Components/Chatquery";
import { Link, Navigate, NavLink } from "react-router-dom";
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
  

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessages(value);
  };

  const getRandomColor = (Colors = ["#2b4539", "#61dca3", "#61b3dc"]) => {
    return Colors[Math.floor(Math.random() * Colors.length)];
  };

  const chatMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (response) => {
      // Update last message's response
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

  const handleUploadClick = () => {
    if (messages.trim() !== "" && selectedChat) {
      // Add query instantly with a placeholder response (null)
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

      // Fire API call
      chatMutation.mutate(messages);

      // Clear input
      setMessages("");
    }
  };

  

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-60 bg-white border-r border-black p-4">
        <NLSidebar
          chats={chats}
          setChats={setChats}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </div>
      <div className="flex-1 flex flex-col bg-gray-50">
        <header className="bg-white p-4 flex justify-between items-center">
          <div className="flex flex-row gap-[980px]">
            <h1 className="text-3xl font-medium font-['Kantumruy_Pro','sans-serif']">
              ELECTRON
            </h1>
            {isLoggedIn ? (
              <div
                className="w-8 h-8 ml-7 rounded-full flex items-center justify-center bg-gray-200 text-white text-lg font-semibold"
                style={{ backgroundColor: getRandomColor() }}
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user?.username?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="border border-gray-300 px-3 py-1.5 font-['Inter','sans-serif'] font-semibold rounded-md hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </header>
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {selectedChat &&
            selectedChat.messages.map((chat, index) => (
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
        </div>
        <footer className="p-4 border border-black mx-10 mb-4">
          {/* Conditional rendering of the list */}

          <div className="flex flex-row">
            <input
              type="text"
              value={messages}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // prevent form submission or newline
                  handleUploadClick();
                }
              }} // Handle input changes
              className="px-4 py-2 flex-grow rounded-md text-[#808080] focus:outline-none"
            />
            <img
              src="/assets/icons/Upload Circle.png"
              alt="Chat"
              className="w-7 h-7 self-center mr-2"
              onClick={handleUploadClick}
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NLChatbot;