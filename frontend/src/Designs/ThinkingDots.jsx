import React from "react";

function ThinkingDots() {
  return (
    <div className="flex space-x-2 py-1"> 
      <span className="w-2.5 h-2.5 rounded-full bg-gray-500 dark:bg-white animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-2.5 h-2.5 rounded-full bg-gray-500 dark:bg-white animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-2.5 h-2.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></span>
    </div>
  );
}

export default ThinkingDots;
