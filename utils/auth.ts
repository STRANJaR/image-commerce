import { NextAuthOptions } from "next-auth";
import Credentials, { CredentialsProvider } from "next-auth/providers/credentials";
import { dbConnect } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            Credentials: {
                email: { label: "Email", type: "email", placeholder: "Email" },
                password: { label: "Password", type: "password", placeholder: "Password" },
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    throw new Error("Invalid credentials");
            }
            try {
                await dbConnect();
                const user = await User.findOne({email: credentials.email});
                
                if(!user) throw new Error("User not found");

                await bcrypt.compare
            } catch (error) {
                console.error('Auth Error: ', error);
                throw error
            }
        })
    ]
}