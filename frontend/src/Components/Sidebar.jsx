import React, { useState } from "react";
import { Moon, LogOut } from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ObjectId } from "bson";
import LogoutModal from "./LogoutModal";

import {
  fetchChats,
  updateChat,
  deleteChat,
} from "../Services/chatService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Sidebar = ({ selectedChat, setSelectedChat }) => {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: chats = [] } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: () => fetchChats(user.id),
    enabled: !!user?.id, // only fetch if logged in
  });

  

  const updateMutation = useMutation({
    mutationFn: ({ chatId, name }) => updateChat({ chatId, name }),
    onSuccess: () => queryClient.invalidateQueries(["chats", user.id]),
  });

  const deleteMutation = useMutation({
    mutationFn: (chatId) => deleteChat(chatId),
    onSuccess: () => queryClient.invalidateQueries(["chats", user.id]),
  });

  const handleNewChat = () => {
    setSelectedChat(8241)
  };

  const handleChatChange = (chatId, newname) => {
    updateMutation.mutate({ chatId, name: newname });
  };

  const handleDeleteChat = (chatId) => {
    deleteMutation.mutate(chatId);
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  };

  const handleConfirmLogout = () => {
    logout();
    setShowModal(false);
    navigate("/chatbot");
  };

  return (
    <div className="flex flex-col h-screen p-2">
      {/* New Chat Button */}
      <div
        className="border font-medium border-black text-[0.75rem] mt-1 cursor-pointer p-2"
        onClick={handleNewChat}
      >
        New Chat
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-scroll pr-1 mt-5 custom-scroll">
        <p className="font-bold font-istok text-[0.75rem]">Today</p>
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`p-2 border font-istok font-normal border-black text-[0.75rem] flex items-center justify-between mt-2 ${
              selectedChat?._id === chat._id ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedChat(chat)}
          >
            <input
              type="text"
              className="w-full border-none outline-none bg-transparent"
              value={chat.name}
              onChange={(e) => handleChatChange(chat._id, e.target.value)}
            />
            <button
              className="ml-2 text-red-500 font-bold"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat._id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Bottom UI with Logout, Premium, Dark Mode */}
      <div className="border-t-2 pt-3 mt-4 mb-5 flex flex-col gap-5 sticky bottom-0 bg-white z-10">
        <div className="flex items-center gap-2 justify-center">
          <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
          <p className="text-sm font-medium font-['Inter','sans-serif'] mr-[76px]">
            Dark Mode
          </p>
        </div>

        {isLoggedIn && (
          <>
            <div className="flex items-center gap-2 justify-center">
              <img
                className="h-5 w-5 sm:h-6 sm:w-6"
                src="assets/icons/crown.png"
                alt="Premium"
              />
              <p className="text-sm font-medium font-['Inter','sans-serif'] mr-[13px]">
                Upgrade to premium
              </p>
            </div>
            <div
              className="flex items-center gap-2 justify-center cursor-pointer hover:border-gray-400"
              onClick={() => setShowModal(true)}
            >
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
              <p className="text-sm font-medium font-['Inter','sans-serif'] mr-[105px]">
                Logout
              </p>
            </div>
          </>
        )}
      </div>

      {/* Logout Modal */}
      {showModal && (
        <LogoutModal
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
