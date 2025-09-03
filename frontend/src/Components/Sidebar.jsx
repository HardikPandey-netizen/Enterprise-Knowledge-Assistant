import React, { useState } from "react";
import { Moon, LogOut, Ellipsis, Sun } from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ObjectId } from "bson";
import LogoutModal from "./LogoutModal";
import { SquarePen } from "lucide-react";
import { useChat } from "../Contexts/ChatContext";
import { fetchChats, updateChat, deleteChat } from "../Services/chatService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../Contexts/ThemeContext";
import moment from "moment";

const Sidebar = () => {
  const { selectedChat, setSelectedChat } = useChat();
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [menuOpenChatId, setMenuOpenChatId] = useState(null);
  const [newName, setNewName] = useState("");
  const { darkMode, setDarkMode } = useTheme();
  const queryClient = useQueryClient();

  const { data: chats = [] } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: () => fetchChats(user.id),
    enabled: !!user?.id,
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
    setSelectedChat(null);
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
    <div className="flex flex-col h-screen p-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* New Chat Button */}
      <div
        onClick={handleNewChat}
        className="flex items-center gap-2 border border-gray-300 dark:border-gray-700
       text-xs mt-1 cursor-pointer p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800"
      >
        <SquarePen className="w-4 h-4" />
        <span>New Chat</span>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-scroll pr-1 mt-5 custom-scroll">
        <p className="font-bold font-istok text-[0.75rem]">Chats</p>
        <div className="flex flex-col ml-1">
          {chats.map((chat) => {
            const isEditing = editingChatId === chat._id;
            const isMenuOpen = menuOpenChatId === chat._id;

            return (
              <div
                key={chat._id}
                className={`p-2 cursor-pointer rounded-s-xs font-istok font-normal border-0 border-gray-300 text-[0.75rem] flex items-center justify-between mt-2 relative
                  ${
                    selectedChat?._id === chat._id
                      ? "bg-gray-200 dark:bg-gray-800"
                      : ""
                  }
                  hover:bg-gray-100 dark:hover:bg-gray-700`}
                onClick={() => !isEditing && setSelectedChat(chat)}
              >
                <div className="flex flex-col">
                  {isEditing ? (
                    <input
                      type="text"
                      className="flex-1 border-none outline-none bg-transparent text-2xl text-gray-900 dark:text-gray-100"
                      value={newName}
                      autoFocus
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => {
                        handleChatChange(chat._id, newName);
                        setEditingChatId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleChatChange(chat._id, newName);
                          setEditingChatId(null);
                        }
                        if (e.key === "Escape") setEditingChatId(null);
                      }}
                    />
                  ) : (
                    <span className="flex-1 truncate text-[12px]">
                      {chat.name}
                    </span>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-gray-400">
                    {moment(chat.createdAt).fromNow()}
                  </p>
                </div>

                <button
                  className="ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenChatId(isMenuOpen ? null : chat._id);
                  }}
                >
                  <Ellipsis className="w-4 h-4 cursor-pointer" />
                </button>

                {isMenuOpen && (
                  <div
                    className="absolute right-2 top-8 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md rounded-md text-xs z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="block w-full px-3 py-2 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setEditingChatId(chat._id);
                        setNewName(chat.name);
                        setMenuOpenChatId(null);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      className="block w-full px-3 py-2 text-left text-red-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        handleDeleteChat(chat._id);
                        setMenuOpenChatId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-3 mt-4 mb-5 flex flex-col gap-3 sticky bottom-0 bg-gray-50 dark:bg-gray-900 z-10">
  {/* Dark/Light Mode Button */}
  <div
    className="flex pl-3 items-center gap-2  cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md"
    onClick={() => setDarkMode(!darkMode)}
  >
    {darkMode ? (
      <>
        <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
        <p className="text-sm font-medium font-['Inter','sans-serif']">
          Light Mode
        </p>
      </>
    ) : (
      <>
        <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
        <p className="text-sm font-medium font-['Inter','sans-serif']">
          Dark Mode
        </p>
      </>
    )}
  </div>

  {isLoggedIn && (
    <>
      {/* Upgrade to Premium */}
      <div className="flex pl-3 items-center gap-2  cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md">
        <img
          className="h-5 w-5 sm:h-6 sm:w-6"
          src="assets/icons/crown.png"
          alt="Premium"
        />
        <p className="text-sm font-medium font-['Inter','sans-serif']">
          Upgrade to Premium
        </p>
      </div>

      {/* Logout */}
      <div
        className="flex pl-3 items-center gap-2  cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md"
        onClick={() => setShowModal(true)}
      >
        <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
        <p className="text-sm font-medium font-['Inter','sans-serif']">
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
