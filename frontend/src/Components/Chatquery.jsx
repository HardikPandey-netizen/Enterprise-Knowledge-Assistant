import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ThinkingDots from "./../Designs/ThinkingDots"

function Chatquery({ query, response, isLoading }) {
  return (
    <div className="flex flex-col gap-3">
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-blue-500 text-white px-4 py-2 rounded-lg shadow">
          {query}
        </div>
      </div>

      {/* Bot response */}
      <div className="flex justify-start">
        <div className="max-w-[75%] bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg shadow text-gray-900 dark:text-gray-100">
          {isLoading ? (
            <ThinkingDots />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chatquery;
