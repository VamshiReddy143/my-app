"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useUserId } from "@/hooks/useUserId";
import toast, { Toaster } from "react-hot-toast";
import ProfileSkeleton from "@/components/profileskeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = useUserId();
  const [name, setName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Mark the component as mounted
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    setLoading(true); // Start loading immediately
    try {
      const response = await fetch(`/api/profile?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user data");
      const data = await response.json();
      setName(data.user.name);
      setImageUrl(data.user.image);
      setFollowers(data.user.followers);
      setFollowing(data.user.following);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false); // Stop loading after data is fetched or an error occurs
    }
  }, [userId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    fetchUserData();
  }, [status, session, fetchUserData, router]);

  if (!mounted) {
    return null; // Prevent rendering anything until the component is mounted
  }

  if (status === "loading" || loading) {
    return <ProfileSkeleton />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("User ID is missing. Please log in again.");
      return;
    }
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("name", name);
    if (image) formData.append("image", image);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
        setImageUrl(data.user.image);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="flex flex-col  items-center sm:pl-[10em] justify-center max-md:w-[100vw] h-screen w-full">
      <h1 className="text-4xl text-gray-600 sm:text-5xl font-bold mb-6 text-center">
        Hello <strong className="text-violet-600">{name || "Guest"} 👋</strong>
      </h1>

      <div className="flex items-start gap-4">
        <div className="mb-6">
          <Image
            src={imageUrl || "/default-avatar.png"}
            alt="Profile"
            width={150}
            height={150}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-md"
          />
        </div>
        <div className="flex sm:mt-9 mt-6 gap-4">
          <div className="flex flex-col items-center">
            <button className="text-violet-600 font-bold bg-[#F1F0FF] p-3 rounded-xl">Following</button>
            <h1 className="text-gray-400 text-5xl font-serif">{following}</h1>
          </div>
          <div className="flex flex-col items-center">
            <button className="text-violet-600 font-bold bg-[#F1F0FF] p-3 rounded-xl">Followers</button>
            <h1 className="text-gray-400 text-5xl font-serif">{followers}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-400">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border-2 border-[#443266] font-serif font-bold focus:outline-none bg-transparent text-white rounded-xl"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400">Email</label>
          <input
            type="email"
            value={session?.user?.email || ""}
            readOnly
            className="w-full p-4 bg-[#C3C3E5] font-serif font-bold border rounded text-[#443266] cursor-not-allowed"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full p-3 border border-gray-700 bg-transparent text-white rounded-xl"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-violet-600 text-white p-5 rounded-xl hover:bg-violet-700 transition-colors"
        >
          Update Profile
        </button>
      </form>
      <Toaster />
    </div>
  );
}