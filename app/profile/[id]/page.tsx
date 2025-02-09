"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  followers: string[];
  following: string[];
}

interface Post {
  _id: string;
  title: string;
  description: string;
}

const ProfilePage = () => {
  const { data: session } = useSession();
  const { id: userId } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // ✅ Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user profile");

      const data = await response.json();
      console.log("my id",session?.user.id)
      console.log("user id",userId)
      setUser(data.user);
      setPosts(data.posts);
      setFollowersCount(data.user.followers.length);
      setFollowingCount(data.user.following.length);
      setIsFollowing(data.user.followers.includes(session?.user?.id));
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }, [userId, session?.user?.id]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // ✅ Handle Follow/Unfollow
  const handleFollow = async () => {
    if (!session) return alert("You need to log in to follow users.");

    try {
      const response = await fetch("/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update follow status");

      setIsFollowing(data.isFollowing);
      setFollowersCount((prev) => (data.isFollowing ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Follow Error:", error);
    }
  };

  if (!user) return <p className="text-white text-center">Loading...</p>;

  return (
    <div className="container flex flex-col sm:ml-[10em] mx-auto mt-10">
      {/* ✅ Profile Info */}
      <div className="flex items-center gap-5">
        <Image
          src={user.image || "https://via.placeholder.com/150"}
          width={100}
          height={100}
          alt="Profile Picture"
          className="rounded-xl w-34 h-34 object-cover"
        />
        <div>
          <h1 className="text-6xl text-[#C3C3E5] font-bold font-serif">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      {/* ✅ Follow Stats & Button */}
      <div className="flex sm:mt-9 mt-6 gap-4">
        <div className="flex flex-col items-center">
          <button className="text-violet-600 font-bold bg-[#F1F0FF] p-3 rounded-xl">Following</button>
          <h1 className="text-gray-400 text-5xl font-serif">{followingCount}</h1>
        </div>
        <div className="flex flex-col items-center">
          <button className="text-violet-600 font-bold bg-[#F1F0FF] p-3 rounded-xl">Followers</button>
          <h1 className="text-gray-400 text-5xl font-serif">{followersCount}</h1>
        </div>
        {session?.user?.id !== userId && (
          <button
            onClick={handleFollow}
            className={`p-3 rounded-xl font-bold ${isFollowing ? "bg-red-500 text-white" : "bg-[#b150cb] text-[#F1F0FF]"}`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <div className="bg-[#F1F0FF] h-[1px] w-full mt-10 mb-4" />

      {/* ✅ User Posts */}
      <h2 className="text-xl text-white font-semibold mt-6">Posts by {user.name}</h2>
      <div className="mt-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="p-4 border border-gray-700 rounded-lg mb-4">
              <h3 className="text-lg font-bold text-white">{post.title}</h3>
              <p className="text-gray-400">{post.description}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
