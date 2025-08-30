import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Chatquery from "../components/chatquery";
import { Link, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchQueries, createChat, createQuery } from "../Services/chatService";
import axios from "axios";

const api = import.meta.env.VITE_AI_URL;

const sendMessage = async (question) => {
  const res = await axios.post(api, { question });
  return res.data.answer;
};

const Chatbot = () => {
  const { user, isLoggedIn } = useAuth();
  const [selectedChat, setSelectedChat] = useState(8241);
  const [messages, setMessages] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const queryClient = useQueryClient();

  const createChatMutation = useMutation({
    mutationFn: ({ userId }) => createChat({ userId }),
    onSuccess: (newChat) => {
      // invalidate to refetch chat list in sidebar
      queryClient.invalidateQueries(["chats", user.id]);
      setSelectedChat(newChat);
    },
  });

  const createQueryMutation = useMutation({
    mutationFn: ({ chatId, query, response }) =>
      createQuery({ chatId, query, response }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["queries", selectedChat?._id]);
      setLocalMessages((prev) =>
        prev.filter((msg) => msg.query !== variables.query)
      );
    },
  });

  const { data: queries = [], isLoading: loadingQueries } = useQuery({
    queryKey: ["queries", selectedChat?._id],
    queryFn: () => fetchQueries({ chatId: selectedChat._id }),
    enabled: !!selectedChat && selectedChat !== 8241, // only run when chat is real
  });

  const handleUploadClick = async () => {
    if (messages.trim() === "") return;

    const newQuery = {
      query: messages,
      response: null,
      isLoading: true,
      tempId: Date.now(),
    };

    setLocalMessages((prev) => [...prev, newQuery]);

    // Step 1: Get AI response
    const answer = await sendMessage(messages);

    if (selectedChat === 8241) {
      createChatMutation.mutate(
        { userId: user.id },
        {
          onSuccess: (newChat) => {
            setSelectedChat(newChat.doc);
            createQueryMutation.mutate({
              chatId: newChat.doc._id,
              query: messages,
              response: answer,
            });
          },
        }
      );
    } else {
      createQueryMutation.mutate({
        chatId: selectedChat._id,
        query: messages,
        response: answer,
      });
    }
    setLocalMessages((prev) =>
      prev.map((msg) =>
        msg.tempId === newQuery.tempId
          ? { ...msg, response: answer, isLoading: false }
          : msg
      )
    );
    setMessages("");
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessages(value);
  };

  const getRandomColor = (Colors = ["#2b4539", "#61dca3", "#61b3dc"]) => {
    return Colors[Math.floor(Math.random() * Colors.length)];
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-60 bg-white border-r border-black p-4">
        <Sidebar
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
              <Link
                to="/profile"
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
              </Link>
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
          {loadingQueries && <p>Loading messages...</p>}
          {queries.map((chat, index) => (
            <Chatquery
              key={index}
              query={chat.query}
              response={chat.response}
              isLoading={false}
            />
          ))}
          {localMessages.map((chat) => (
            <Chatquery
              key={chat.tempId}
              query={chat.query}
              response={chat.response}
              isLoading={chat.isLoading}
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

export default Chatbot;