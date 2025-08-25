import React, { useState, useEffect } from "react";
import { Moon, LogOut } from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ selectedChat, setSelectedChat, chats, setChats }) => {
  const { logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const storedChats = localStorage.getItem("chats");
    if (storedChats) {
      setChats(JSON.parse(storedChats));
    } else {
      setChats([{ title: "Laptop Recommendations", messages: [] }]);
    }
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  const handleNewChat = () => {
    setSelectedChat({ title: "New Chat", messages: [] }); 
  };

  const handleChatChange = (index, newTitle) => {
    const updatedChats = [...chats];
    updatedChats[index].title = newTitle;
    setChats(updatedChats);
  };

  const handleDeleteChat = (index) => {
    const updatedChats = chats.filter((_, chatIndex) => chatIndex !== index);
    setChats(updatedChats);
    if (index === selectedChat) {
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
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`p-2 border font-istok font-normal border-black text-[0.75rem] flex items-center justify-between mt-2 ${
              selectedChat === chat ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedChat(chats[index])}
          >
            <input
              type="text"
              className="w-full border-none outline-none bg-transparent"
              value={chat.title}
              onChange={(e) => handleChatChange(index, e.target.value)}
            />
            <button
              className="ml-2 text-red-500 font-bold"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(index);
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