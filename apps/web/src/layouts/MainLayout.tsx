import { PropsWithChildren } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type MainLayoutProps = PropsWithChildren<{
  showJoinUs?: boolean;
}>;

export default function MainLayout({ children, showJoinUs }: MainLayoutProps) {
  const isAddCompanyPage = window.location.pathname === '/add-company' || window.location.pathname === '/esummit';
  
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 md:pt-32">{children}</main>
      {/* Hide footer completely for add-company pages */}
      {!isAddCompanyPage && <Footer />}
    </div>
  );
}

