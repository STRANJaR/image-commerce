import Product, { IProduct } from "@/models/Product";
import { authOptions } from "@/utils/auth";
import { dbConnect } from "@/utils/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();
        const products = await Product.find({}).lean()

        if (!products || products.length === 0) {
            return NextResponse.json({
                error: "Products not found",

            }, { status: 404 })
        }

        return NextResponse.json({ products }, { status: 200 })

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to get products" }, { status: 500 })
    }
}


export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }


        await dbConnect();

        const body: IProduct = await request.json();
        if (
            !body.name ||
            !body.description ||
            !body.imageUrl ||
            body.variants.length === 0
        ) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        const newProduct = await Product.create(body);

        return NextResponse.json(
            { message: "Product created successfully", product: newProduct },
            { status: 201 }
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        )
    }
}