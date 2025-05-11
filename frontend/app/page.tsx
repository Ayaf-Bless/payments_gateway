"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import StatsCard from "@/components/dashboard/stats-card";
import TransactionList, {
  Transaction,
} from "@/components/dashboard/transaction-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CircleDollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { UserProfile } from "@/interfaces";

// Define transaction interface based on API response
interface ApiTransaction {
  id: string;
  transactionRef: string;
  amount: number;
  currency: string;
  payer: string;
  payee: string;
  status: string;
  createdAt: string;
  payerReference: string;
  type: "incoming" | "outgoing";
}

// Define stats interface based on API response
interface ApiStats {
  totalTransactions: number;
  totalSent: number;
  totalReceived: number;
  pendingAmount: number;
  currency: string;
}

const Index = () => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [stats, setStats] = useState<ApiStats>({
    totalTransactions: 0,
    totalSent: 0,
    totalReceived: 0,
    pendingAmount: 0,
    currency: "UGX",
  });

  const { authenticated, loading, token } = useAuthCheck();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token || !authenticated) return;

      try {
        const response = await fetch(`${backendUrl}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.statusCode === 200 && result.data) {
            setUserProfile({
              firstName: result.data.firstName,
              lastName: result.data.lastName,
              email: result.data.email,
            });

            // Save to localStorage for persistence
            localStorage.setItem("userProfile", JSON.stringify(result.data));
          }
        } else {
          console.error("Failed to fetch user profile:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const fetchDashboardStats = async () => {
      if (!token || !authenticated) return;

      try {
        const response = await fetch(`${backendUrl}/payments/stats`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.statusCode === 200 && result.data) {
            // Set stats
            if (result.data) {
              setStats(result.data);
            }

            // Map API transactions to component's expected format
            if (result.data.recentTransactions) {
              const formattedTransactions: Transaction[] =
                result.data.recentTransactions.map((tx: ApiTransaction) => ({
                  id: tx.id,
                  reference: tx.transactionRef,
                  payerReference: tx.payerReference,
                  amount: tx.amount,
                  currency: tx.currency,
                  status: tx.status.toLowerCase(),
                  type: tx.type,
                  date: new Date(tx.createdAt),
                  recipient: tx.payee,
                  sender: tx.payer,
                }));

              setRecentTransactions(formattedTransactions);
            }
          }
        } else {
          console.error("Failed to fetch dashboard data:", response.statusText);

          // Fallback to localStorage data if API fails
          const savedPayments = localStorage.getItem("payments");
          if (savedPayments) {
            const parsedPayments = JSON.parse(savedPayments);
            setRecentTransactions(parsedPayments.slice(0, 5));
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // Fallback to localStorage data if API fails
        const savedPayments = localStorage.getItem("payments");
        if (savedPayments) {
          const parsedPayments = JSON.parse(savedPayments);
          setRecentTransactions(parsedPayments.slice(0, 5));
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDashboardRecentTransactions = async () => {
      if (!token || !authenticated) return;

      try {
        const response = await fetch(`${backendUrl}/payments/transactions`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.statusCode === 200 && result.data) {
            // Set stats
            if (result.data) {
              setRecentTransactions(result.data);
            }
          }
        } else {
          console.error("Failed to fetch dashboard data:", response.statusText);

          // Fallback to localStorage data if API fails
          const savedPayments = localStorage.getItem("payments");
          if (savedPayments) {
            const parsedPayments = JSON.parse(savedPayments);
            setRecentTransactions(parsedPayments.slice(0, 5));
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // Fallback to localStorage data if API fails
        const savedPayments = localStorage.getItem("payments");
        if (savedPayments) {
          const parsedPayments = JSON.parse(savedPayments);
          setRecentTransactions(parsedPayments.slice(0, 5));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (authenticated && token) {
      fetchUserProfile();
      fetchDashboardStats();
      fetchDashboardRecentTransactions();
      // fetchDashboardData();
    } else if (!loading) {
      // If not authenticated and not loading, set loading to false
      setIsLoading(false);
    }
  }, [authenticated, token, loading, backendUrl]);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Format currency values
  const formatCurrency = (value: number, currency: string = "UGX") => {
    return `${currency} ${value.toLocaleString()}`;
  };

  return (
    <AppLayout>
      <div className="container py-8 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getGreeting()}, {userProfile.firstName || "Welcome"}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s an overview of your account
            </p>
          </div>
          <Button asChild className="bg-dfcuGreen hover:bg-green-700">
            <Link href="/payments/create">New Payment</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Transactions"
            value={isLoading ? "..." : stats.totalTransactions.toString()}
            description="Past 30 days"
            icon={<CircleDollarSign className="h-4 w-4" />}
            // trend={{ value: 12, positive: true }}
          />
          <StatsCard
            title="Total Sent"
            value={
              isLoading
                ? "..."
                : formatCurrency(stats.totalSent, stats.currency)
            }
            description="Past 30 days"
            icon={<ArrowUpRight className="h-4 w-4" />}
          />
          <StatsCard
            title="Total Received"
            value={
              isLoading
                ? "..."
                : formatCurrency(stats.totalReceived, stats.currency)
            }
            description="Past 30 days"
            icon={<ArrowDownLeft className="h-4 w-4" />}
          />
          <StatsCard
            title="Pending"
            value={
              isLoading
                ? "..."
                : formatCurrency(stats.pendingAmount, stats.currency)
            }
            description="Processing now"
            icon={<CreditCard className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TransactionList
              transactions={recentTransactions}
              title="Recent Transactions"
              description="Your latest payment activity"
            />
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used services</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/payments/create">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Make a Payment
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/profile">
                    <CircleDollarSign className="mr-2 h-4 w-4" />
                    View Account Details
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/payments">
                    <ArrowDownLeft className="mr-2 h-4 w-4" />
                    View All Transactions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
