"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

// Debounce function to optimize API calls
const useDebounce = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const debouncedQuery = useDebounce(query, 300); // ✅ Debounced for performance
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cachedResults, setCachedResults] = useState({}); // ✅ Cache previous searches

    const { data: session, status } = useSession();

  // Fetch Users & Communities (Random OR Search)
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (cachedResults[searchQuery]) {
      setUsers(cachedResults[searchQuery].users);
      setCommunities(cachedResults[searchQuery].communities);
      return;
    }
  
    setLoading(true);
    try {
      const endpoint = searchQuery ? `/api/search?q=${searchQuery}` : `/api/search/random`;
      const response = await fetch(endpoint, {
        headers: {
          "x-user-id": session?.user?.id || "", // ✅ Send logged-in user's ID
        },
      });
      const data = await response.json();
      setUsers(data.users);
      setCommunities(data.communities);
      setCachedResults((prev) => ({ ...prev, [searchQuery]: data })); // ✅ Cache results
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  }, [cachedResults, session]);
  

  // Fetch data on search change
  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  return (
    <div className="container mx-auto mt-10 px-4">
      {/* Search Input */}
      <div className="relative w-[600px] bg-gray-100 rounded-2xl shadow-md p-1.5 transition-all duration-150 ease-in-out hover:scale-105 hover:shadow-lg">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-8 pr-24 py-3 text-base text-gray-700 bg-transparent rounded-lg focus:outline-none"
          placeholder="Search for users or communities..."
          defaultValue={query}
          onChange={(e) => router.push(`/search?q=${e.target.value}`)}
        />
      </div>

      {loading && <p className="text-gray-400 mt-4">Loading...</p>}

      {/* Users Section */}
      <h2 className="text-white text-2xl mt-10 font-semibold mb-3">Users</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {users.length > 0 ? (
          users.map((user) => (
            <Link key={user._id} href={`/profile/${user._id}`} className="flex items-center gap-3 bg-gray-900 p-2 rounded-xl">
              <Image src={user.image || "/default-avatar.png"} width={50} height={50} className="rounded-full h-[60px] w-[60px] object-cover" alt="User Avatar" />
              <span className="text-white">{user.name}</span>
            </Link>
          ))
        ) : (
          <p className="text-gray-400">No users found.</p>
        )}
      </div>

      {/* Communities Section */}
      <h2 className="text-white text-2xl font-semibold mt-6 mb-3">Communities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {communities.length > 0 ? (
          communities.map((community) => (
            <Link key={community._id} href={`/community/${community._id}`} className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl">
              <Image src={community.image || "/default-avatar.png"} width={50} height={50} className="rounded-full" alt="Community Avatar" />
              <span className="text-white">{community.name}</span>
            </Link>
          ))
        ) : (
          <p className="text-gray-400">No communities found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
