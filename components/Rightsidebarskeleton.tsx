import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="fixed top-0 right-0 h-screen w-[350px] bg-gray-900 border-l border-gray-700 overflow-y-auto p-4 space-y-4 animate-pulse">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="border border-gray-600 p-4 rounded-xl bg-gray-800"
        >
          <div className="flex justify-between gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
              <div>
                <div className="h-4 w-28 bg-gray-700 rounded"></div>
                <div className="h-3 w-20 bg-gray-700 rounded mt-2"></div>
              </div>
            </div>
            <div className="h-8 w-24 bg-gray-700 rounded"></div>
          </div>
          <div className="h-3 w-full bg-gray-700 rounded mt-3"></div>
          <div className="h-3 w-3/4 bg-gray-700 rounded mt-2"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;