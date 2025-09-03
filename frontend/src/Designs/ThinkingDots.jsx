import React from "react";

function ThinkingDots() {
  return (
    <div className="flex space-x-1">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></span>
    </div>
  );
}

export default ThinkingDots;
