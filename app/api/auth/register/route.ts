import User from "@/models/User";
import { dbConnect } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        await dbConnect();

        const existingUser = await User.findOne({ email })
        if (existingUser) return NextResponse.json({ error: "User already exists" }, { status: 400 })

        const user = await User.create({ email, password, role: "user" });

        return NextResponse.json(
            { message: "User created successfully", user },
            { status: 201 }
        )



    } catch (error) {
        console.error("Registration error: ", error);
        return NextResponse.json(
            { message: "Failed to register user" },
            { status: 501 }
        )
    }
}