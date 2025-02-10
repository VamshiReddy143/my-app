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

  

  return (
    <div className="mt-[5em]" >
 
      <CreatePost communities={communities}  postType="community"/> 
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