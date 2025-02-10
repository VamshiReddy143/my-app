"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Search, Upload } from "lucide-react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import Head from "next/head";

interface PostData {
  title: string;
  description: string;
  tags: string;
}

interface Props {
  communities: [];
}

const CreatePost = ({ communities, postType = "normal" }: Props & { postType?: "community" | "normal" }) => {

  const [activeTab, setActiveTab] = useState<"text" | "media" | "link">("text");
  const [imageUrl, setImageUrl] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [postData, setPostData] = useState<PostData>({ title: "", tags: "", description: "" });

  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);



  //to show image when it is selected
  useEffect(() => {
    if (imageUrl) {
      const preview = URL.createObjectURL(imageUrl);
      setImagePreview(preview);
      return () => URL.revokeObjectURL(preview);
    }
  }, [imageUrl]);



  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPostData((prevData) => ({ ...prevData, [name]: value }));
  }, []);


  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/community/search?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSearchResults(response.data.communities);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search Error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };


  const handleSelectCommunity = (communityId: string) => {
    setSelectedCommunity(communityId);
    setSearchQuery(""); // Clear search input after selection
    setSearchResults([]); // Clear search results
  };

  // Handle tags input
  const handleTagChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value.split(",").map((tag) => tag.trim()));
  }, []);


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postData.title || !postData.description) {
      toast.error("All fields are required");
      return;
    }

    if (!postData.title || !postData.description) {
      toast.error("Title and description are required");
      return;
    }

    const isCommunityPost = postType === "community";

    if (isCommunityPost && !selectedCommunity) {
      toast.error("Please select a community for this post.");
      return;
    }



    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("description", postData.description);
    if (isCommunityPost) {
      formData.append("community", selectedCommunity!);
    }

    if (imageUrl) {
      formData.append("image", imageUrl);
    }


    formData.append("tags", tags.join(","));

    setLoading(true);
    setProgress(0);

    try {
      const response = await axios.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      });

      if (response.data.success) {
        setSelectedCommunity(communities?.length > 0 ? communities[0]._id : null);
        toast.success("Post created successfully");
        setPostData({ title: "", description: "", tags: "" });
        setTags([]);
        setImageUrl(null);
        setImagePreview(null);
      } else {
        toast.error(response.data.message || "Failed to create post");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [postData, imageUrl, tags, selectedCommunity, postType, communities]);


  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) setImageUrl(file);
  }, []);

  // Dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
    },
  });

  return (
    <>
      <Head>
        <title>Create Post | MyWebsite</title>
        <meta name="description" content="Create a new post with text, media, or links." />
      </Head>

      <div className=" p-5 mt-10 ">
        <form onSubmit={handleSubmit} >
          <h1 className="text-gray-400 text-2xl sm:text-3xl font-bold">Create Post</h1>

          {postType === "community" && (
            <div className="">
              <div className="absolute mt-8 ml-2 text-black flex items-center">
                <Search />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="focus:outline-none text-black sm:px-10 px-[12em] p-3 mt-5 rounded-full w-full sm:w-[30em]"
                placeholder="Select a community"
              />
            </div>
          )}

          {loading && <p>Searching...</p>}
          {searchResults.length > 0 && (
            <ul className="border border-gray-500 rounded-xl mt-2 p-3  max-h-48 overflow-y-auto">
              {searchResults.map((community) => (
                <li
                  key={community._id}
                  onClick={() => handleSelectCommunity(community._id)}
                  className="p-2 cursor-pointer  hover:bg-gray-700 rounded-full flex items-center gap-2"
                >
                  {community.image && (
                    <Image src={community.image} alt={community.name} height={50} width={50} className="w-8 h-8 rounded-full" />
                  )}
                  <span className="text-white">{community.name}</span>


                </li>


              ))}

            </ul>
          )}


          {selectedCommunity && (
            <div className="text-white mt-10  flex items-center gap-4">
              <strong className="text-xl font-bold ">Selected Community:</strong>
              <div className="flex items-center gap-2 bg-gray-800 p-4 rounded-full cursor-pointer">
                <span>
                  {communities?.find((c) => c._id === selectedCommunity)?.name || "Unknown"}
                </span>
                {communities?.find((c) => c._id === selectedCommunity)?.image && (
                  <Image
                    src={communities.find((c) => c._id === selectedCommunity)?.image || "/default-community.png"}
                    alt="Community Image"
                    height={500}
                    width={500}
                    className="rounded-full h-10 w-10 object-cover"
                  />
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-6">
            <ul className="flex flex-wrap gap-4 sm:gap-10 text-base sm:text-xl font-bold">
              {["text", "media", "link"].map((tab) => (
                <li
                  key={tab}
                  className={`text-gray-400 cursor-pointer ${activeTab === tab ? "border-b-4 border-violet-600" : ""}`}
                  onClick={() => setActiveTab(tab as "text" | "media" | "link")}
                >
                  {tab === "media" ? "Images & Video" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </li>
              ))}
            </ul>
          </div>

          {/* Title Input */}
          <div className="relative mt-6">
            <input
              type="text"
              name="title"
              value={postData.title}
              onChange={handleChange}
              id="title"
              placeholder="Enter title"
              className=" focus:outline-none bg-transparent border-[1px] border-gray-400 text-white px-4  p-4 sm:p-6 rounded-lg w-full  sm:w-[50em]"
            />
          </div>

          {/* Tags Input */}
          <div className="mt-6">
            <h3 className="text-gray-400 text-lg font-bold mb-2">Tags</h3>
            <input
              type="text"
              placeholder="Enter tags, separated by commas"
              value={tags.join(", ")}
              onChange={handleTagChange}
              className="border p-4 text-white focus:outline-none border-gray-500 bg-transparent rounded-lg w-full sm:w-[50em]"
            />
          </div>

          {/* Post Content */}
          <div className="mt-6">
            {activeTab === "text" && (
              <motion.textarea
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                placeholder="Write your post here..."
                name="description"
                value={postData.description}
                onChange={handleChange}
                className="border p-4 text-white focus:outline-none border-gray-500 bg-transparent w-full sm:w-[50em] h-[10em] rounded-lg"
              />
            )}

            {activeTab === "media" && (
              <div {...getRootProps()} className="border-[1px]  border-gray-500 p-4 flex flex-col items-center justify-center rounded-lg h-fit  cursor-pointer">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <Upload size={40} fill="white" className="bg-gray-600 p-2 flex justify-center rounded-full"/>
                  <input {...getInputProps()} className="hidden" placeholder="Upload Image"/>

                  {imagePreview && (
                    <div className="mt-4 flex justify-center">
                      {imageUrl?.type.startsWith("image/") ? (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          height={800}
                          width={800}
                          className="max-w-[150px] max-h-[150px] object-cover  rounded-lg"
                        />
                      ) : (
                        <video
                          src={imagePreview}
                          controls
                          className="max-w-[200px] max-h-[150px] object-cover rounded-lg"
                        />
                      )}
                    
                    <button
                        onClick={() => { setImageUrl(null); setImagePreview(null); }}
                        className="text-red-500 text-sm mt-2 ml-2"
                      >
                        Remove file
                        
                      </button>
                    
                    </div>
                  )}

                </motion.div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button className="bg-violet-600 text-white px-6 py-3 rounded-full hover:bg-violet-700">
              {loading ? `Uploading... ${progress}%` : "Post"}
            </button>
          </div>
        </form>

        <Toaster />
      </div>
    </>
  );
};

export default CreatePost;
