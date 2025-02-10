"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import JoinCommunityButton from "@/components/JoinCommunityButton";
import { useUserId } from "@/hooks/useUserId";
import RightSidebarSkeleton from "./Rightsidebarskeleton";

interface Community {
  _id: string;
  id: string;
  name: string;
  image: string;
  description: string;
  members: {
    id: string;
  }[];
}

const RightSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = useUserId();

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      console.log("Fetching communities...");
      const response = await fetch("/api/community");
      const data = await response.json();
      console.log("Communities Fetched:", data.communities);
      setCommunities(data.communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleMemberChange = (communityId: string, joined: boolean) => {
    setCommunities((prev) =>
      prev.map((community) =>
        community._id === communityId
          ? {
              ...community,
              members: joined
                ? [...community?.members, { id: userId ?? "" }]
                : community.members.slice(0, -1),
            }
          : community
      )
    );
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-2 right-4 bg-violet-600 text-white p-2 rounded-full z-50"
      >
        {isOpen ? "Close" : "Open"} Communities
      </button>

      {/* Sidebar or Skeleton Loader */}
      <div
        className={`fixed top-0 right-0 h-screen w-[350px] bg-gray-900 border-l border-gray-700 overflow-y-auto transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full" // Only depends on `isOpen` for mobile
        } md:translate-x-0`} // Always visible on larger screens
      >
        {/* Show Skeleton Loader During Loading */}
        {loading ? (
          <RightSidebarSkeleton />
        ) : (
          <>
            {/* Sidebar Header */}
            <div className="mx-auto ml-3  mt-5">
              <h1 className="text-white font-bold text-2xl sm:text-3xl">Communities</h1>
            </div>

            {/* Community List */}
            <div className="space-y-4 px-4 mt-6">
              {communities.length > 0 ? (
                communities.map((community: Community) => (
                  <div
                    key={community._id}
                    className="border border-gray-600 p-4 rounded-xl bg-gray-800"
                  >
                    <div className="flex justify-between gap-4 items-center">
                      <Link href={`/community/${community._id}`}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={community.image || "/default-community.png"}
                            alt={community.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <h1 className="font-bold text-white">{community.name}</h1>
                            <p className="text-sm text-gray-400">
                              {community.members?.length || 0}{" "}
                              {community.members?.length === 1 ? "Member" : "Members"}
                            </p>
                          </div>
                        </div>
                      </Link>

                      <JoinCommunityButton
                        communityId={community._id}
                        onMemberChange={handleMemberChange}
                      />
                    </div>
                    <p className="mt-3 text-sm text-gray-400">{community.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No communities available.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RightSidebar;