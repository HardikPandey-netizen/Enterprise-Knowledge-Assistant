import React, { useState,useEffect,useRef } from "react";
import Sidebar from "../Components/Sidebar";
import Chatquery from "../Components/Chatquery";
import { Link } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchQueries, createChat, createQuery } from "../Services/chatService";
import { useChat } from "../Contexts/ChatContext";
import axios from "axios";

const api = import.meta.env.VITE_AI_URL;

const sendMessage = async (question) => {
  const res = await axios.post(api, { question });
  return res.data.answer;
};

const Chatbot = () => {
  const { user, isLoggedIn } = useAuth();
  const { selectedChat, setSelectedChat } = useChat();
  const [messages, setMessages] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);

  

  const createChatMutation = useMutation({
    mutationFn: ({ userId }) => createChat({ userId }),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries(["chats", user.id]);
      setSelectedChat(newChat.doc);
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
    enabled: !!selectedChat?._id,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [queries, localMessages]);

  const handleUploadClick = async () => {
    if (messages.trim() === "") return;

    const currentMessage = messages;
    const tempId = Date.now();
    const newQuery = {
      query: currentMessage,
      response: null,
      isLoading: true,
      tempId,
    };

    setLocalMessages((prev) => [...prev, newQuery]);
    setMessages("");

    const processQuery = async (chatId) => {
      try {
        const answer = await sendMessage(currentMessage);
        createQueryMutation.mutate({
          chatId,
          query: currentMessage,
          response: answer,
        });

        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? { ...msg, response: answer, isLoading: false }
              : msg
          )
        );
      } catch (err) {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? {
                  ...msg,
                  response: "⚠️ Error fetching response",
                  isLoading: false,
                }
              : msg
          )
        );
      }
    };

    if (!selectedChat?._id) {
      createChatMutation.mutate(
        { userId: user.id },
        {
          onSuccess: (newChat) => {
            setSelectedChat(newChat.doc);
            processQuery(newChat.doc._id);
          },
        }
      );
    } else {
      processQuery(selectedChat._id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-300 dark:border-gray-700 h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <h1 className="text-xl font-semibold tracking-wide">ELECTRON</h1>

          {isLoggedIn ? (
            <div
              
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-400 text-white font-semibold"
            >
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
          {loadingQueries ? (
            <p className="text-gray-500">Loading messages...</p>
          ) : !selectedChat ||
            (queries.length === 0 && localMessages.length === 0) ? (
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

export default Chatbot;
