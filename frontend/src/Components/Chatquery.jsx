import { useState,useEffect } from "react";


function Chatquery({ query, response,isLoading }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <>
      <div>
        <div className="flex flex-row-reverse mr-2">
          <div className="bg-[#E0E8FF] px-3 py-1 border border-black">
            <p className="text-black">{query}</p>
          </div>
        </div>
        <div className="mt-7 ml-2 pl-3 px-5 py-3 border border-black inline-block">
          <div className="flex flex-col gap-2 text-left items-start">
            {response ? response : `Thinking${dots}`}
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatquery;
