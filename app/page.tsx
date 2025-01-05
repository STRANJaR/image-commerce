'use client';

import { IProduct } from "@/models/Product";
import axios from "axios";
import { useEffect, useState } from "react";
import ImageGallery from "./components/ImageGallery";

export default function Home() {

  const [products, setProducts] = useState<IProduct[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data} = await axios.get('/api/products')
        console.log('data: ', data)
        setProducts(data.products)

      } catch (error) {
        console.log('Errro fetch products: ', error)
      }
    }

    fetchProducts();
  }, [])
  return (
    <main className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">ImageKit Shop</h1>
    <ImageGallery products={products} />
  </main>
  );
}
