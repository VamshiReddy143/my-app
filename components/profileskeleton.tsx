import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center sm:pl-[10em] justify-center max-md:w-[100vw] h-screen w-full animate-pulse">
      {/* Title */}
      <div className="text-4xl text-gray-300 sm:text-5xl font-bold mb-6 text-center">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
      </div>

      {/* Profile Image and Stats */}
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className="mb-6">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200 shadow-md"></div>
        </div>

        {/* Following and Followers */}
        <div className="flex sm:mt-9 mt-6 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-24 h-10 bg-gray-200 rounded-xl"></div>
            <div className="h-8 w-16 bg-gray-200 rounded mt-2"></div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-10 bg-gray-200 rounded-xl"></div>
            <div className="h-8 w-16 bg-gray-200 rounded mt-2"></div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 rounded-lg shadow-md w-full max-w-md bg-white">
        {/* Name Field */}
        <div className="mb-4">
          <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
        </div>

        {/* Profile Picture Field */}
        <div className="mb-4">
          <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
        </div>

        {/* Submit Button */}
        <div className="w-full h-14 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}