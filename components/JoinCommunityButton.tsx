"use client";
import React, { useState, useEffect } from "react";
import { useUserId } from "@/hooks/useUserId"; // ✅ Import the custom hook

interface Props {
  communityId: string;
  onMemberChange: (communityId: string, joined: boolean) => void;
}

const JoinCommunityButton = ({ communityId, onMemberChange }: Props) => {
  const userId = useUserId(); // ✅ Get validated user ID
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return; // ✅ Wait for userId to load

    const fetchMembershipStatus = async () => {
      try {
        const response = await fetch(`/api/community/${communityId}`);
        const data = await response.json();

        if (data.success) {
          setIsMember(data.community.members.some((member: any) => member._id === userId));
        }
      } catch (error) {
        console.error("Error checking membership:", error);
      }
    };

    fetchMembershipStatus();
  }, [communityId, userId]); // ✅ Depend on `userId`, not `session`

  const handleJoinLeave = async () => {
    if (!userId) {
      alert("You must be logged in to join this community.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/community/${communityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // ✅ Send userId in request
      });

      const data = await response.json();
      if (data.success) {
        setIsMember(data.joined); // ✅ Update button state
        onMemberChange(communityId, data.joined);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to join/leave community:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleJoinLeave}
      className={`py-2 px-4 rounded-full text-sm transition ${
        isMember ? "bg-red-600 hover:bg-red-700" : "bg-violet-600 hover:bg-violet-700"
      }`}
      disabled={loading}
    >
      {loading ? "Processing..." : isMember ? "Leave" : "Join"}
    </button>
  );
};

export default JoinCommunityButton;
