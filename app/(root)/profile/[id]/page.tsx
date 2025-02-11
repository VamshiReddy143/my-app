"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useUserId } from "@/hooks/useUserId";
import { LikeOrDislikePost } from "@/components/PostActions";

import Loading from "@/components/loading";
import { set } from "mongoose";



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
  image?: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  likes: string[];
  dislikes: string[];
  comments: {
    _id: string;
    content: string;
    user: {
      name: string;
      image: string;
    };
  }[];
  createdAt: number;
}

const ProfilePage = () => {
  const { data: session } = useSession();
  const { id: userId } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);


  const myId = useUserId();
  const likeOrDislikePost = LikeOrDislikePost();



  const fetchUserProfile = useCallback(async () => {
    if (!userId || !session?.user?.id) return;
    setLoading(true);
   

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user profile");

      const data = await response.json();
      setUser(data.user);
      setPosts(data.posts); // Fetching only user's posts
      setFollowersCount(data.user.followers.length);
      setFollowingCount(data.user.following.length);

      // Check if logged-in user follows this profile
      const isUserFollowing = data.user.followers.includes(myId);
      setIsFollowing(isUserFollowing);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, session?.user?.id, myId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleFollow = async () => {
    if (!session) return alert("You need to log in to follow users.");
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-white text-center">Loading...</p>;
  if (loading) return (
    <Loading />
  );

  return (
    <div className="container pr-[30em] flex flex-col p-3 mx-auto mt-[5em]">
      {/* Profile Header */}
      <div className="flex items-center gap-5">
        <Image
          src={user.image || "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg"}
          width={100}
          height={100}
          alt="Profile Picture"
          className="rounded-xl w-34 h-34 object-cover"
        />
        <div>
          <h1 className="text-6xl text-[#C3C3E5] font-bold font-serif">{user.name}</h1>
          <p className="text-gray-400 mt-3">{user.email}</p>
        </div>
      </div>

      {/* Followers and Following Stats */}
      <div className="flex items-center sm:mt-9 mt-6 gap-4">
        <div className="flex flex-col items-center">
          <button className="text-violet-600 font-bold bg-[#F1F0FF] p-3 rounded-xl">Following</button>
          <h1 className="text-gray-400 text-5xl font-serif">{followingCount}</h1>
        </div>
        <div className="flex flex-col items-center">
          <button className="text-violet-600 font-bold bg-[#F1F0FF] p-3 rounded-xl">Followers</button>
          <h1 className="text-gray-400 text-5xl font-serif">{followersCount}</h1>
        </div>
        {session?.user?.id !== userId && (
          <div className="flex flex-col items-center">
            <button
              onClick={handleFollow}
              className={`p-3 rounded-xl font-bold ${isFollowing ? "bg-red-500 text-white" : "bg-violet-600 text-[#F1F0FF]"}`}
            >
              {isFollowing ? "Unfollow" : "Follow"}


            </button>
            <h1 className="text-gray-400 text-5xl font-serif text-transparent">*</h1>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="bg-[#F1F0FF] h-[1px] w-full mt-10 mb-4" />

      {/* User Posts Section */}
      {loading ? (
        <p className="text-white text-center">Loading posts...</p>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} className="mb-6">
            <h1 className="text-white text-xl font-bold mt-4 sm:text-2xl">{post.title}</h1>
            <p className="text-gray-400 mt-2">{post.description}</p>


            {post.image &&
              (post.image.endsWith(".mp4") || post.image.endsWith(".webm") ? (
                <video
                  src={post.image}
                  controls
                  className="mt-4 rounded-3xl  h-auto w-full max-h-[400px] object-cover"
                />
              ) : (
                <Image
                  src={post.image}
                  width={900}
                  height={900}
                  loading="lazy"
                  alt="Post image"
                  className=" mt-10 h-auto rounded-xl"
                />
              ))}

            {/* Likes, Comments, Share Buttons */}
            <div className="flex items-center gap-2 text-white mt-4">
              <button onClick={() => likeOrDislikePost(post._id, "like", setPosts)} className={`bg-gray-600 px-4 py-2 rounded-full flex items-center gap-1 hover:bg-violet-600 transition-colors ${myId && post.likes?.includes(myId) ? "bg-violet-600" : ""}`}>
                🢁 {post.likes?.length}
              </button>

              <button onClick={() => likeOrDislikePost(post._id, "dislike", setPosts)} className={`bg-gray-600 px-4 py-2 rounded-full flex items-center gap-1 hover:bg-violet-600 transition-colors ${post.dislikes?.includes(myId) ? "bg-violet-600" : ""}`}>
                🢃 {post.dislikes?.length}
              </button>

           
            </div>


          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center">No posts yet</p>
      )}
    </div>
  );
};

export default ProfilePage;
