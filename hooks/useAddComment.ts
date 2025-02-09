import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

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
}

type SetPosts = React.Dispatch<React.SetStateAction<PostsData[]>>;

export const useAddComment = (setPosts: SetPosts) => {
  const { data: session, status } = useSession();

  return useCallback(async (postId: string, content: string) => {
    if (status === "loading" || !session?.user?.id) return toast.error("You must be logged in.");
    if (!postId) return toast.error("Post ID is missing!");
    if (!content.trim()) return toast.error("Comment cannot be empty!");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      console.log("Comment Data:", data.comment);

      if (!response.ok) throw new Error(data.message || "Failed to add comment.");

      // Update posts state with the new comment
      setPosts((prevPosts: PostsData[]) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...post.comments, data.comment], // Use the populated comment from API
              }
            : post
        )
      );

      toast.success("Comment added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add comment.");
    }
  }, [session, status, setPosts]);
};
