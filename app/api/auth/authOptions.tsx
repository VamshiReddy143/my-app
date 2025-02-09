import { dbConnect } from "@/lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import { Session,User as NextAuthUser } from "next-auth";
import type { NextAuthOptions } from "next-auth";  


import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email", placeholder: "email" },
        password: { label: "password", type: "password", placeholder: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("User not found");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: NextAuthUser; account?: any }) {
      if (account?.provider === "google") {
        await dbConnect();
        let existingUser = await User.findOne({ email: user?.email });

        if (!existingUser) {

          existingUser = await User.create({
            googleId: user?.id, 
            email: user?.email,
            name: user?.name,
            image: user?.image,
          });
        }


        token.id = user?.id; 
      } else if (user) {
        token.id = user.id?.toString() || "";
        token.email = user.email;
        token.name = user.name;
      }

      
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string; 
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }

    
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
