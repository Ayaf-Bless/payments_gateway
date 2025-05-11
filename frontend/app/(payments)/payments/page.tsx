"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import PaymentList from "@/components/payments/payment-list";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Payment } from "@/interfaces";

interface PaymentsResponse {
  data: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const { authenticated, token } = useAuthCheck();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchPayments = async (pageNumber = 1, pageLimit = 10) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/payments?page=${pageNumber}&limit=${pageLimit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentsResponse = await response.json();
      setPayments(data.data);
      setMeta(data.meta);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch payments when component mounts or when authentication is complete
  useEffect(() => {
    if (authenticated && token) {
      fetchPayments(page, limit);
    }
  }, [authenticated, token, page, limit]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <AppLayout requireAuth>
      <div className="container py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <Button asChild className="bg-dfcuGreen hover:bg-green-700">
            <Link href="/payments/create">
              <CreditCard className="mr-2 h-4 w-4" />
              New Payment
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dfcuGreen"></div>
          </div>
        ) : (
          <>
            <PaymentList payments={payments} />

            {/* Basic Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    handlePageChange(Math.min(meta.totalPages, page + 1))
                  }
                  disabled={page === meta.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default PaymentsPage;
