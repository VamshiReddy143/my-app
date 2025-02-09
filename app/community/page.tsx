"use client";
import React, { useEffect, useState } from "react";
import CreatePost from "../posts/createpost/page";


const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch("/api/community");
        if (!response.ok) throw new Error("Failed to fetch communities");
        const data = await response.json();
        console.log("✅ Fetched Communities:", data.communities); // Debugging Log
        setCommunities(data.communities);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  if (loading) return <div>Loading...</div>;

  console.log("✅ Passing to RightSidebar:", communities); // Debugging Log

  return (
    <div >
  
      {/* <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold mb-6">Communities</h1>
        {communities.length > 0 ? (
          <div className="space-y-6">
            {communities.map((community) => (
              <div key={community._id} className="border p-4 rounded-lg flex gap-4">
               
                <div>
                  <Image
                    src={community.image || "/default-avatar.png"}
                    alt={community.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                </div>

                <div className="flex-grow">
                  <Link href={`/community/${community._id}`}>
                    <h2 className="text-xl font-semibold hover:underline cursor-pointer">
                      {community.name}
                    </h2>
                  </Link>
                  <p className="text-gray-600">{community.description}</p>
                  <p className="text-sm text-gray-500">
                    Members: {community.members?.length || 0}
                  </p>
                </div>

                <div>
                  <JoinCommunityButton />

                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No communities available.</p>
        )}
      </div> */}
      <CreatePost communities={communities}/> 
    </div>
  );
};

export default CommunitiesPage;








// "use client";
// import React, { useEffect, useState } from "react";
// import JoinCommunityButton from "@/components/JoinCommunityButton";
// import CreatePost from "@/components/Posts/CreatePost";
// import RightSidebar from "@/components/RightSidebar";

// const CommunitiesPage = () => {
//   const [communities, setCommunities] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCommunities = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch("/api/community");
//         if (!response.ok) throw new Error("Failed to fetch communities");
//         const data = await response.json();
//         setCommunities(data.communities);
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCommunities();
//   }, []);

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div>
//       {communities.length > 0 ? (
//         <div className="space-y-6">
//           {communities.map((community) => (
//             <div key={community._id} className="border p-4 rounded-lg flex gap-4">
//               <RightSidebar community={community}   />
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>No communities available.</p>
//       )}
//     </div>
//   );
// };

// export default CommunitiesPage;