"use client";

import React, { useEffect, useState } from "react";
import { Home, LogOut, Plus, Podcast, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react"; // ✅ Import useSession
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.jpg"

const Paths = [
  { name: "Home", url: "/", icon: Home },
  { name: "Search", url: "/search", icon: Search },
  { name: "Post", url: "/posts/createpost", icon: Plus },
  { name: "Profile", url: "/profile", icon: Podcast },
  { name: "Create Community", url: "/community/createcommunity", icon: Plus },
];

const Leftsidebar = () => {
  const pathname = usePathname();
  const { status } = useSession(); // ✅ Get session status
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // ✅ Fix hydration issue by ensuring it's client-side
  }, []);

  return (
    <>

    {/* <div>
    <Image
          src={logo}
          alt="Logo"
          width={100}
          height={100}
          className="w-[100px] h-[100px] flex items-center justify-center mx-auto sm:block hidden" 
        />
    </div> */}

      <nav className="h-screen  top-0 left-0 flex-col hidden p-4 sm:flex ">
       
        {Paths.map((path) => (
          <Link href={path.url} key={path.name} title={path.name} aria-label={path.name}>
            <div
              className={`flex gap-5 rounded-xl p-4 mt-4 items-center w-full h-20 cursor-pointer hover:bg-gray-700 ${pathname === path.url ? "bg-violet-600" : ""
                }`}
            >
              <path.icon className="w-6 h-6" aria-hidden="true" />
              <p className="text-lg font-bold">{path.name}</p>
            </div>
          </Link>
        ))}

        {/* ✅ Render Logout Button Only on Client-Side to Prevent Hydration Errors */}
        {isClient && status === "authenticated" && (
          <button
            onClick={() => signOut({ callbackUrl: "/register" })}
            className="flex gap-3 rounded-xl p-4 mt-4 items-center w-full h-20 cursor-pointer hover:bg-gray-700"
          >
            <LogOut className="w-6 h-6" />
            Log Out
          </button>
        )}
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black text-white border-t border-gray-500">
        <div className="flex justify-around items-center py-4">
          {Paths.map((item) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.url}
                className={`flex flex-col items-center ${isActive ? "text-violet-600" : "text-white"
                  }`}
              >
                <Icon className="w-7 h-7" />
                <span className="text-xs mt-1">{item.name.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Leftsidebar;
