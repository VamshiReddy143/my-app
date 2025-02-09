

import { useCallback } from "react";
import toast from "react-hot-toast";





interface Post {
  _id: string;
  title: string;
  description: string;
  image?: string;
  likes: string[];
  dislikes: string[];
}

export const useDeletePost = () => {
  return useCallback(async (postId: string, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete post");
        return;
      }

      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId)); 
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
      console.error(error);
    }
  }, []);
};



export const LikeOrDislikePost =()=>{
    return useCallback(async(postId:string,action :"like" | "dislike",setPosts:React.Dispatch<React.SetStateAction<Post[]>>) =>{
    try {
        const res = await fetch (`/api/posts/${postId}`,{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body :JSON.stringify({action})
        })
        if(!res.ok){
            toast.error("Failed to like or dislike post")
            return
        }
        const data = await res.json()
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === postId ? { ...post, likes: data.likes, dislikes: data.dislikes } : post
            )
          );
    } catch(error) {
        console.error(error)
    }
},[])
}


export const Sharepost=()=>{
  return useCallback(async(postId:string)=>{
    const postUrl = `${window.location.origin}/posts/${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Post URL copied to clipboard");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  },[])
}