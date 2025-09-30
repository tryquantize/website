import { PropsWithChildren } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type MainLayoutProps = PropsWithChildren<{
  showJoinUs?: boolean;
}>;

export default function MainLayout({ children, showJoinUs }: MainLayoutProps) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-12 md:pt-24">{children}</main>
      <Footer showJoinUs={showJoinUs} />
    </div>
  );
}

