import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "Email" },
                password: { label: "Password", type: "password", placeholder: "Password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }
                try {
                    await dbConnect();
                    const user = await User.findOne({ email: credentials.email });

                    if (!user) throw new Error("User not found");

                    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                    if (!isValidPassword) throw new Error("Invalid password");

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        role: user.role,
                    }

                } catch (error) {
                    console.error('Auth Error: ', error);
                    throw error
                }
            }
        })
    ],

    // callbacks 
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token
        },

        async session({ session, token }) {
            session.user._id = token.id as string;
            session.user.role = token.role as string;

            return session
        }
    },

    // pages 
    pages: {
        signIn: '/login',
        error: '/login',
    },

    // session 
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },

    secret: process.env.NEXTAUTH_SECRET
}