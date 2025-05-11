import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, CreditCard, LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

const MainNav: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Call the logout API route
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("userProfile");
      setIsLoggedIn(false);

      toast({
        title: "Logged out",
        description: "Until next time",
        variant: "default",
      });
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Error during logout",
        description: "Error during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Payments", href: "/payments" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <CircleDollarSign className="h-6 w-6 text-dfcuGreen" />
            <span className="text-xl font-bold text-dfcuBlue">
              dfcu SwiftPay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="ml-6 hidden md:flex gap-6">
            {isLoggedIn &&
              navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-dfcuGreen ${
                    pathname === link.href
                      ? "text-dfcuGreen"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
          </nav>
        </div>

        {/* Desktop Authentication */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost" className="gap-2">
                <Link href="/payments/create">
                  <CreditCard className="h-4 w-4" />
                  <span>New Payment</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                variant="default"
                className="bg-dfcuGreen hover:bg-green-700"
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-dfcuGreen" />
                <span>dfcu SwiftPay</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4">
              {isLoggedIn &&
                navLinks.map((link) => (
                  <SheetClose asChild key={link.name}>
                    <Link
                      href={link.href}
                      className={`flex items-center py-2 text-base font-medium transition-colors hover:text-dfcuGreen ${
                        pathname === link.href
                          ? "text-dfcuGreen"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </SheetClose>
                ))}

              {isLoggedIn && (
                <SheetClose asChild>
                  <Link
                    href="/payments/create"
                    className="flex items-center py-2 text-base font-medium text-dfcuGreen"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    New Payment
                  </Link>
                </SheetClose>
              )}

              <div className="mt-4 pt-4 border-t">
                {isLoggedIn ? (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-center"
                      >
                        <Link href="/login">Login</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="w-full justify-center bg-dfcuGreen hover:bg-green-700"
                      >
                        <Link href="/register">Register</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default MainNav;
