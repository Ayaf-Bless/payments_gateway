"use client";
import { ReactNode } from "react";
import MainNav from "./main-nav";
import { useRouter } from "next/navigation";

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  requireAuth = true,
}) => {
  const isAuthenticated = true;

  // Redirect to login if authentication is required but user is not logged in
  const router = useRouter();
  if (requireAuth && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">{children}</main>
      <footer className="py-6 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} dfcu SwiftPay. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-dfcuGreen">
              Terms
            </a>
            <a href="#" className="hover:text-dfcuGreen">
              Privacy
            </a>
            <a href="#" className="hover:text-dfcuGreen">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
