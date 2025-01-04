import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/utils/db";
import Order from "@/models/Order";
import nodemailer from "nodemailer";



export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            )
        }

        const event = JSON.parse(body);
        await dbConnect();

        // handle webhook when payment is captured 
        if (event.event === 'payment.captured') {
            console.log('Event payload: ', event.payload);
            const payment = event.payload.payment.entity;

            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: payment.order_id },
                {
                    razrorpayPaymentId: payment.id,
                    status: 'completed',
                }
            ).populate([
                { path: 'productId', select: 'name' },
                { path: 'userId', select: 'email' }
            ])

            if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

            const transporter = nodemailer.createTransport({
                service: 'sandbox.smtp.mailtrap.io',
                port: 2525,
                auth: {
                    user: process.env.MAILTRAP_USER,
                    pass: process.env.MAILTRAP_PASSWORD,
                }
            });

            await transporter.sendMail({
                from: 'your@example.com',
                to: order.userId.email,
                subject: 'Order confirmation',
                text: `Your order for ${order.productId.name} has been confirmed.`,
            });
        }

        return NextResponse.json({ message: 'success' }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to handle razorpay webhook" },
            { status: 500 }
        )
    }
}