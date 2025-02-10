"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const CreateCommunityForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const router = useRouter();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, image }),
      });
      if (!response.ok){
        toast.error("community creation failed or community already exists");
        return
      }
      
      toast.success("Community created successfully");
      router.push("/community"); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to create community");
    }
  };

  return (
<div className="mt-[5em] pl-2">
  <h1 className="text-3xl text-gray-700 font-bold mb-6">CREATE A COMMUNITY</h1>
<form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Community Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border-[1px] focus:outline-none border-gray-700 text-white bg-transparent p-4 rounded-xl w-full"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
       className="border-[1px] focus:outline-none border-gray-700 bg-transparent text-white p-4 rounded-xl w-full"
        required
      />
      <input
        type="url"
        placeholder="Image URL (optional)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className="border-[1px] focus:outline-none border-gray-700 bg-transparent p-4 rounded-xl text-white w-full"
      />
      <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-xl">
        Create Community
      </button>
    </form>
    <Toaster/>
</div>
  );
};

export default CreateCommunityForm;