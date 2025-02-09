"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { useDeletePost } from '@/components/PostActions';
import { LikeOrDislikePost } from '@/components/PostActions';
import { Sharepost } from '@/components/PostActions';
import { useAddComment } from "@/hooks/useAddComment";

import { useUserId } from "@/hooks/useUserId";




interface PostsData {
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
  tags: string[];
  createdAt: number;
  community?: {
    _id: string;
    name: string;
  }; 
}

const Home = () => {

  const [posts, setPosts] = useState<PostsData[]>([])
  const { data: session, status } = useSession()
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});


  console.log("Posts:", posts)

  const colors = [
    "bg-red-200", "bg-green-200", "bg-blue-200", "bg-yellow-200",
    "bg-purple-200", "bg-pink-200", "bg-orange-200", "bg-teal-200"
  ];

  const deletePost = useDeletePost()
  const likeOrDislikePost = LikeOrDislikePost()
  const sharepost = Sharepost()
  const addComment = useAddComment(setPosts);

  const userId = useUserId();


  const getTimeAgo = (timestamp: number) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    return `${diffHours} hrs ago`;
  };

  const toggleComments = (PostId: string) => {
    setOpenComments((prev) => ({
      ...prev, [PostId]: !prev[PostId]
    }))
  }

  useEffect(() => {
    if (status !== "authenticated") return
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data.posts);


      } catch (error) {
        toast.error("Error fetching posts");
        console.error(error);
      }
    }
    fetchPosts()
  }, [status])


  return (
    <div className="mx-auto container mt-10 px-4 sm:pr-[20em]">
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id}>
            <div className="flex items-center gap-2">
              <Image
                src={post.user?.image || "https://cdn.vectorstock.com/i/1000v/96/80/blank-profile-image-placeholder-icon-vector-50719680.jpg"}
                width={40}
                height={40}
                alt="Profile picture"
                className="rounded-full h-10 w-10 object-cover"
              />

              <div className="text-gray-400 flex items-center gap-3">
                <Link href={`/profile/${post.user?._id}`}>
                  <h1 className="text-white text-lg font-bold">{post.user?.name}</h1>
                </Link>

                <p>•</p>
                <strong className="text-gray-600">{getTimeAgo(post.createdAt)}</strong>
                {userId === post.user?._id && (
                  <button onClick={() => deletePost(post._id, setPosts)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  
                )}
                
              </div>

            </div>
            <h1 className="text-white text-xl font-bold mt-4 sm:text-2xl">{post.title}</h1>
          
            <p className="text-gray-400 mt-2 line-clamp-3 sm:line-clamp-4">{post.description}</p>
            <Link href={`/community/${post?.community?._id}`} passHref>
  {post?.community ? (
    <p className={`text-sm font-bold mt-3 text-gray-900 p-2 rounded-full w-fit 
      ${colors[Math.floor(Math.random() * colors.length)]}`}>
      {post.community.name}
    </p>
  ) : (
    <p className="text-gray-500 text-sm">No Community</p> // ✅ Show fallback text
  )}
</Link>


            {post.tags && post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}


            {post.image &&
              (post.image.endsWith(".mp4") || post.image.endsWith(".webm") ? (
                <video
                  src={post.image}
                  controls
                  className="mt-4 rounded-3xl w-full h-auto max-h-[400px] object-cover"
                />
              ) : (
                <Image
                  src={post.image}
                  width={900}
                  height={900}
                  loading="lazy"
                  alt="Post image"
                  className="mt-4 rounded-3xl w-full  object-contain  max-h-[400px]"
                />
              ))}


            <div className="flex items-center gap-2 text-white mt-4">
              <button onClick={() => likeOrDislikePost(post._id, "like", setPosts)} className={`bg-gray-600 px-4 py-2 rounded-full flex items-center gap-1 hover:bg-violet-600 transition-colors ${session?.user?.id && post.likes?.includes(session?.user?.id) ? "bg-violet-600" : ""}`}>
                🢁 {post.likes.length}
              </button>

              <button onClick={() => likeOrDislikePost(post._id, "dislike", setPosts)} className={`bg-gray-600 px-4 py-2 rounded-full flex items-center gap-1 hover:bg-violet-600 transition-colors ${session?.user?.id && post.likes?.includes(session?.user?.id) ? "bg-violet-600" : ""}`}>
                🢃 {post.dislikes?.length}
              </button>

              <button onClick={() => sharepost(post._id)} className='bg-gray-600 px-5 py-2 rounded-full flex items-center gap-1 hover:bg-blue-600 transition-colors'>
                ➦ Share
              </button>

              <button onClick={() => toggleComments(post._id)} className="bg-gray-600 px-4 py-2 rounded-full flex items-center gap-1 hover:bg-gray-800 transition-colors">
                💬 {post.comments?.length}
              </button>
            </div>


            {openComments[post._id] && (
              <div className='mt-4'>
                <h3 className="text-gray-400 text-lg font-bold mb-2">Comments</h3>
                {post.comments.length > 0 ? (
                  post.comments.map((comment, index) => (
                    <div key={comment._id || index} className="flex  bg-gray-800 p-3 rounded-xl items-center gap-4 mb-2">
                      <Image
                        src={comment.user?.image || "https://cdn.vectorstock.com/i/1000v/96/80/blank-profile-image-placeholder-icon-vector-50719680.jpg"}
                        width={30}
                        height={30}
                        alt="Profile picture"
                        className="rounded-full h-8 w-8 object-cover"
                      />

                      <div>
                        <h4 className="text-white font-semibold">{comment.user?.name}</h4>
                        <p className="text-gray-400">{comment.content}</p>
                      </div>
                    </div>

                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const content = e.currentTarget.comment.value.trim();
                    if (!content) return alert("Comment cannot be empty!");
                    addComment(post._id, content);
                    e.currentTarget.reset();
                  }}
                  className="flex items-center gap-2 mt-4"
                >
                  <input
                    type="text"
                    name="comment"
                    placeholder="Write a comment..."
                    className="border p-2 text-white focus:outline-none border-gray-500 bg-transparent rounded-[30px] w-full"
                  />
                  <button
                    type="submit"
                    className="bg-violet-600 text-white px-4 py-2 rounded-full hover:bg-violet-700 transition-colors"
                  >
                    Post
                  </button>
                </form>
              </div>
            )}
            <div className="bg-gray-400 h-[1px] my-4" />
          </div>


        ))
      ) : (
        <p>No posts yet</p>
      )}
      <Toaster />
    </div>
  )
}

export default Home