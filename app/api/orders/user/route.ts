import Order from "@/models/Order";
import { authOptions } from "@/utils/auth";
import { dbConnect } from "@/utils/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })


        await dbConnect();

        const orders = await Order.find({ userId: session.user._id })
            .populate({
                path: 'productId',
                select: 'name imageUrl',
                options: { strictPopulate: false },
            })
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json(
            { orders },
            { status: 200 }
        )

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to get orders" },
            { status: 500 }
        )
    }
}