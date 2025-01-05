"use client";

import AdminCreateProduct from "../components/admin/AdminCreateProduct";



export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
        <AdminCreateProduct />  
      </div>
    </div>
  );
}