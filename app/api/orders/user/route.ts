import Order from "@/models/Order";
import { authOptions } from "@/utils/auth";
import { dbConnect } from "@/utils/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
});


export async function POST(request: NextRequest){
    try {
        const session = await getServerSession(authOptions);
        if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const {productId, variant} = await request.json();

        await dbConnect();

        // create razorpay order 
        const order = await razorpay.orders.create({
            amount: Math.round(variant.price * 100),
            currency: 'USD',
            receipt: `recept-${Date.now()}`,
            notes: {
                productId: productId.toString(),
                variant: variant.type,
                userId: session.user.id,
            }
        })

        const newOrder = await Order.create({
            userId: session.user.id,
            productId,
            variant,
            razorpayOrderId: order.id,
            amount: Math.round(variant.price * 100),
            status: 'pending',
        })


        return NextResponse.json(
            {
                orderId: order.id,
                message: "Order created successfully",
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                dbOrderId: newOrder._id
                
            },
            {status: 201}
        )


    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        )
    }
}