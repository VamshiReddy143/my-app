"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useUserId } from "@/hooks/useUserId";
import { useDeletePost } from '@/components/PostActions';
import Loading from "@/components/loading";





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
}

const CommunityDetails = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params); // Unwrap params using React.use()
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState<PostsData[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [joined,setJoined] = useState(false);
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});


  const userId = useUserId();
   const deletePost = useDeletePost()

  const toggleComments = (postId: string) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggle visibility for the clicked post
    }));
  };


  const getTimeAgo = (timestamp:number) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
    if (diffHours < 1) return "Just now";
    return `${diffHours} hrs ago`;
  };


  // Define all Hooks at the top level

  const handlePostAction = useCallback(async (postId: string, action: "like" | "dislike") => {
    if (status === "loading" || !userId) return alert("You must be logged in.");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ userId: session?.user.id, action }),
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to perform action.");
      }

      const data = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: data.likes, dislikes: data.dislikes } : post
        )
      );
    } catch (error) {
      console.error(error);
    }
  }, [status,userId]);

  const handleSharePost = useCallback(async (postId: string) => {
    const postUrl = `${window.location.origin}/posts/${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link.");
    }
  }, []);

  const handleComment = useCallback(async (postId: string, content: string) => {
    if (status === "loading" || !userId) return alert("You must be logged in.");
    if (!postId) return alert("Post ID is missing!");
  
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ userId: session.user.id, content }),
        body: JSON.stringify({ userId, content }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add comment.");
  
    
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...post.comments, data.comment],
              }
            : post
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to add comment.");
    }
  }, [userId, status]);
  


    useEffect(() => {
      const fetchCommunityDetails = async () => {
        try {
          const response = await fetch(`/api/community/${id}`);
          const data = await response.json();
    
          if (response.ok) {
            setCommunity(data.community);
            setPosts(data.posts); // ✅ Posts will now have populated comments
            setJoined(data.community.members.some((member: any) => member._id === userId));
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchCommunityDetails();
    }, [id, session,userId]);
    
  


  const handlejoin = async (communityId: string) => {
    try {
      const response = await fetch(`/api/community/${communityId}`, { method: "PUT" });
      const data = await response.json();
  
      if (response.ok) {
        setJoined(data.joined); // ✅ Update button text
  
        // ✅ Update community members list dynamically
        setCommunity((prevCommunity) => {
          if (!prevCommunity) return prevCommunity; // Avoid errors if state is null
  
          let updatedMembers;
          if (data.joined) {
            // ✅ Add user to members list
            updatedMembers = [...prevCommunity.members, { _id: session?.user?.id, name: session?.user?.name, image: session?.user?.image }];
          } else {
            // ✅ Remove user from members list
            updatedMembers = prevCommunity.members.filter((member) => member._id !== session?.user?.id);
          }
  
          return { ...prevCommunity, members: updatedMembers };
        });
      }
    } catch (error) {
      console.error(" Error joining/leaving community:", error);
    }
  };
  

  if (loading) return <div>
    <Loading/>
  </div>;
  if (!community) return <div>Community not found</div>;

  return (
    <div className="w-full mt-[5em] sm:pr-[20em]">
      <div className="flex items-center gap-5">
        {community.image && (
          <Image
            src={community.image}
            alt="Community Image"
            width={900}
            height={900}
            className="rounded-full h-[80px] w-[80px] "

          />
        )}
        <div>
          <h1 className="text-3xl text-white font-bold">{community.name}</h1>
          <h2 className="text-xl text-gray-500 font-semibold">{community.members?.length || 0} Members</h2>
        </div>
      </div>


 <div className="flex gap-5 items-center">
 <div>
    <Link href={"/community"}>
     <div className="mt-10 text-white flex  hover:bg-gray-800 items-center border w-[fit-content] rounded-full p-2 px-3 gap-2 cursor-pointer ">
         <h1 className="text-5xl text-white ">+</h1><button className="text-xl"> Create Post</button>
      </div>
     </Link>
    </div>

     <div>
      <button onClick={()=>handlejoin(community._id)} className="mt-10 text-white hover:bg-gray-800 flex text-xl items-center border w-[fit-content] rounded-full p-3 px-5 gap-2 cursor-pointer ">
        {
          joined ? "Leave" : "Join"
        }
      </button>

     </div>
 </div>

      {/* Members Section */}
      <div className="mt-6">

      <div className="flex -space-x-4 mt-2">
  {community.members?.slice(0, 5).map((member, index) => ( // Show first 5 members
    <div key={member._id} className="relative w-10 h-10">
      <Image
        src={member.image ||  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAqgMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABgcDBAUBAv/EADgQAAIBAwEFAwkGBwAAAAAAAAABAgMEBREGITFBUWGBkRITIiMyQqGx0RRSU3FywRUkMzRzsvD/xAAWAQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAMAwEAAhEDEQA/ALSABpkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB3mjlspbYuh5yu25P2Ka9qf/AHUhWR2jyF7JqNXzFLlCk9PF8WDVharhqe95UzqVJPWVSo31cmbtlmchZSToXM9F7s35SfcwaswHEwe0VDJtUasVSutPZT3T/S/2O34gAAAAAAAAAAAAAAAAAAAMF7dU7K0q3NZ+hTWr7eiM5E9urzSFvZxb0l6ya+CAjORva2Qu53Nw/SlwjyiuiNYA0gAAPqEpQnGUG1KL1i1xTLD2cyn8Usdamn2iloqi69Jd5XR2NlLv7LmKUdWoVvVy059PiZVYYHMAAAAAAAAAAAAAAAAACBbaScs1o+VKOnxJ6Qbbem45WnPlOktO5sCOgA0gAABnsZON9byXFVY/NGA28TTdXJ2lNc6sfmZVaAAAAAAAAAAAAAAAAAAAEb23s5VrCndRWsqD9PT7r5+JJD4q04Vac6dSKlCacZJ8GmBU4OtncJVxdZyjFztJP0Ki93sfb8zklAADTAkOxdm6+Slctert48esnwXzORj7C4yNwqNtTcpe9L3YLq2WLisfSxllG3o79H5U5c5S5sg3Hx7wAAAAAAAAAAAAAAAAAAAAHkkpRcZKMotaNSW5nGu9l8ZcPWNOVGT50paLwe437zJ2Vj/dXNOD+7rq/BHHr7X2EH6qlXq9yiviBiexlrruu6yX6YmxbbI46lJSqyrVuyUtF8DUe2tPXdY1NP8AKvoZqW2VnJpVbavT7U1ICQW1vRtaSpW9KFOC5QWhlObZ53G3jUaV1GMn7tT0WdIAAAAAAAAAAAAAAAAAAc7N5alirXzk9J1p7qVPX2n9AM2RyNtjqPnbqoop+zFb5SfYiF5Taa9vHKFBu2odIv0n+bOVe3le+uJV7mbnN+CXRdhgAPe9d+r4vXeACoAAoadTo43NX2N0VCq5Utd9Ko9Yv6HOBBYuFztrlEoL1VxzpTfH8up1ipYSlCSlCTjKL1UluaZONmdoPt+lpeNK5S9CXDzi+pFSIAAAAAAAAAAAABhurila29SvXl5NOEXJsrTKX9bJXdS5uN2u6MeUVyRItt79uVLHwlu3VKunXkv37yJoAACxKAAoAAAAAB9U5zpzU6cnGcWpJriu0+QRYsjZ/KLKWCqTeleD8mrHt5PvOmVzszf/AMPylNylpSq+rnrwWr3PuLGIAAAAAAAAB5u58D01cnVdDHXVVcY0ZNeAFcZS5d5kbm5b/qVG12LgvgkaoQLEoACgAAAAAAAAAAQa1WhZ2GuneYy2ryes5QSl+a3MrEnWxNVzxEofh1Wl3rUipCACAAAAAAHO2hemDvNPwpAAVqACxAAFAAAAAAAAAAACZ7Bv+SuVy86v9T0Eok4AI0AAI//Z"}
        alt="Member Avatar"
        width={40}
        height={40}
        className="rounded-full border-2 w-[40px] h-[40px] border-gray-800 object-cover"
      />
    </div>
  ))}
  {community.members?.length > 5 && (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-white border-2 border-gray-800">
      +{community.members.length - 5}
    </div>
  )}
</div>

      </div>

      {/* Posts Section */}
      <div className="mt-5">
        <div className="w-full h-[1px] bg-gray-500"/>
        {posts?.length > 0 ? (
          posts?.map((post) => (
            <div key={post._id} className="p-4 rounded-lg mb-4 ">
               {/* Post Author */}
               <div className="flex items-center gap-2 mt-4">
                <Image
                  src={post.user.image || "/default-avatar.png"}
                  alt="Post Author Avatar"
                  width={30}
                  height={30}
                  className="rounded-full h-10 w-10 object-cover"
                />
                <span className="text-sm text-gray-400">{post.user.name}</span>
                <strong className="text-gray-600">{getTimeAgo(post.createdAt)}</strong>

                {userId === post.user?._id && (
                  <button onClick={() => deletePost(post._id, setPosts)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <h3 className="text-2xl font-semibold mt-10 text-white">{post.title}</h3>

              {/* Post Description */}
              <p className="text-gray-400 mt-1 text-lg">{post.description}</p>

              
            {post.tags && post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

             
              {post.image && (
                <div className="mt-7 ">
                  {post.image.endsWith(".mp4") || post.image.endsWith(".webm") ? (
                    <video controls className="w-full h-auto">
                      <source src={post.image} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={post.image}
                      alt="Post Image"
                      width={900}
                      height={900}
                      className="w-[90%] h-auto rounded-xl"
                    />
                  )}
                </div>
              )}

             

              {/* Interaction Buttons */}
              <div className="flex gap-4 mt-4 text-white">
                {/* Like Button */}
                <button
                onClick={() => handlePostAction(post._id, "like")}
                disabled={status === "loading" }
                className={`bg-gray-600 px-4 py-2 rounded-full flex items-center gap-1 hover:bg-violet-600 transition-colors ${post.likes?.includes(session.user.id) ? "bg-violet-600" : ""
                  }`}
              >
                🢁 {post.likes.length}
              </button>

                {/* Dislike Button */}
                <button
                onClick={() => handlePostAction(post._id, "dislike")}
                disabled={status === "loading" }
                className={`bg-gray-600 px-4 py-2 rounded-full flex items-center gap-1 hover:bg-red-600 transition-colors ${post.dislikes?.includes(session?.user?.id) ? "bg-red-600" : ""
                  }`}
              >
                🢃 {post.dislikes?.length}
              </button>

                {/* Share Button */}
                <button
                  onClick={() => handleSharePost(post._id)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-full flex items-center gap-1 hover:bg-blue-600 transition-colors"
                >
                  ➦ Share
                </button>

                {/* Comments Count */}
                <span onClick={()=>toggleComments(post._id)} className="bg-gray-600 text-white px-3 py-2 cursor-pointer rounded-full">💬 {post.comments?.length}</span>
              </div>

              {/* Comments Section */}
              {openComments[post._id] && (
                       <div className="mt-4">
                       <h3 className="text-md font-semibold text-white">Comments</h3>
                       {post.comments &&post.comments?.length > 0 ? (
                         post.comments?.map((comment, index) => (
                           <div key={index} className="flex  bg-gray-800 p-3 rounded-xl items-center gap-4 mb-2">
                             <Image
                               src={comment.user?.image || "https://via.placeholder.com/50"}
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
       
       
       
                       {/* Comment Input */}
                       <form
                         onSubmit={(e) => {
                           e.preventDefault();
                           const content = e.currentTarget.comment.value.trim();
                           if (!content) return;
                           handleComment(post._id, content);
                           e.currentTarget.reset();
                         }}
                         className="flex items-center gap-2 mt-4"
                       >
                         <input
                           type="text"
                           name="comment"
                           placeholder="Add a comment..."
                           className="border border-gray-700 bg-transparent text-white  p-2 w-full rounded-xl"
                         />
                         <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-full">
                           Post
                         </button>
                       </form>
                     </div>
              )}
          
            </div>
          ))
        ) : (
          <p className="text-gray-400">No posts available in this community.</p>
        )}
      </div>

    </div>
  );
};

export default CommunityDetails;