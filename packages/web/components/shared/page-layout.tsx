"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnimatedLayout } from "@/components/layout/animated-layout";
import { LoadingTransition } from "./loading-transition";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoadingTransition />
      <AnimatedLayout>
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-12 md:pt-24">{children}</main>
          <Footer />
        </div>
      </AnimatedLayout>
    </>
  );
}
