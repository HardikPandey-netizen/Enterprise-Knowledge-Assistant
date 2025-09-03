import React, { useState, useEffect } from "react";
import { Moon, Sun, LogOut, Ellipsis, SquarePen } from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutModal from "./LogoutModal";
import { useTheme } from "../Contexts/ThemeContext";
import moment from "moment";

const NLSidebar = ({ selectedChat, setSelectedChat, chats, setChats }) => {
  const { logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingChatIndex, setEditingChatIndex] = useState(null);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [newName, setNewName] = useState("");
  const { darkMode, setDarkMode } = useTheme();

  // Load from localStorage
  useEffect(() => {
    const storedChats = localStorage.getItem("chats");
    if (storedChats) {
      setChats(JSON.parse(storedChats));
    } else {
      setChats([
        {
          title: "Laptop Recommendations",
          messages: [],
          createdAt: new Date(),
        },
      ]);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  const handleNewChat = () => {
    setSelectedChat({ title: "New Chat", messages: [] });
  };

  const handleChatRename = (index, newTitle) => {
    const updatedChats = [...chats];
    updatedChats[index].title = newTitle;
    setChats(updatedChats);
  };

  const handleDeleteChat = (index) => {
    const updatedChats = chats.filter((_, i) => i !== index);
    setChats(updatedChats);
    if (selectedChat === chats[index]) {
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
          {chats.map((chat, index) => {
            const isEditing = editingChatIndex === index;
            const isMenuOpen = menuOpenIndex === index;

            return (
              <div
                key={index}
                className={`p-2 cursor-pointer rounded-md font-istok font-normal text-[0.75rem] flex items-center justify-between mt-2 relative
                  ${selectedChat === chat ? "bg-gray-200 dark:bg-gray-800" : ""}
                  hover:bg-gray-100 dark:hover:bg-gray-700`}
                onClick={() => !isEditing && setSelectedChat(chat)}
              >
                <div className="flex flex-col">
                  {isEditing ? (
                    <input
                      type="text"
                      className="flex-1 border-none outline-none bg-transparent text-sm text-gray-900 dark:text-gray-100"
                      value={newName}
                      autoFocus
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => {
                        handleChatRename(index, newName);
                        setEditingChatIndex(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleChatRename(index, newName);
                          setEditingChatIndex(null);
                        }
                        if (e.key === "Escape") setEditingChatIndex(null);
                      }}
                    />
                  ) : (
                    <span className="flex-1 truncate text-[12px]">
                      {chat.title}
                    </span>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-gray-400">
                    {chat.createdAt
                      ? moment(chat.createdAt).fromNow()
                      : "just now"}
                  </p>
                </div>

                <button
                  className="ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenIndex(isMenuOpen ? null : index);
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
                        setEditingChatIndex(index);
                        setNewName(chat.title);
                        setMenuOpenIndex(null);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      className="block w-full px-3 py-2 text-left text-red-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        handleDeleteChat(index);
                        setMenuOpenIndex(null);
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

      {/* Bottom Actions */}
      <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-3 mt-4 mb-5 flex flex-col gap-3 sticky bottom-0 bg-gray-50 dark:bg-gray-900 z-10">
        {/* Dark/Light Mode */}
        <div
          className="flex pl-3 items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? (
            <>
              <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
              <p className="text-sm font-medium">Light Mode</p>
            </>
          ) : (
            <>
              <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
              <p className="text-sm font-medium">Dark Mode</p>
            </>
          )}
        </div>

        {isLoggedIn && (
          <>
            {/* Premium */}
            <div className="flex pl-3 items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md">
              <img
                className="h-5 w-5 sm:h-6 sm:w-6"
                src="assets/icons/crown.png"
                alt="Premium"
              />
              <p className="text-sm font-medium">Upgrade to Premium</p>
            </div>

            {/* Logout */}
            <div
              className="flex pl-3 items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md"
              onClick={() => setShowModal(true)}
            >
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
              <p className="text-sm font-medium">Logout</p>
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

export default NLSidebar;
