"use client";

import MainLayout from "@/layouts/MainLayout";
import ProductsHero from "@/sections/Products/ProductsHero";
import ProductGrid from "@/sections/Products/ProductGrid";

export default function ProductsPage() {
  return (
    <MainLayout>
      <ProductsHero />
      <ProductGrid />
    </MainLayout>
  );
}

