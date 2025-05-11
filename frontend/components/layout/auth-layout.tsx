"use client";
import { ReactNode } from "react";
import { CircleDollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  requireAuth = false,
}) => {
  const isAuthenticated = false;

  // Redirect logic
  const router = useRouter();

  if (requireAuth && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="py-4 text-center border-b">
        <Link href="/" className="inline-flex items-center gap-2">
          <CircleDollarSign className="h-6 w-6 text-dfcuGreen" />
          <span className="text-xl font-bold text-dfcuBlue">dfcu PayGat</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-muted/30">
        {children}
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} dfcu PayGat. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
