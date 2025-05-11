"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import PaymentDetail from "@/components/payments/payment-detail";
import { useParams } from "next/navigation";
import { Payment } from "@/interfaces";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useRouter } from "next/navigation";

const PaymentDetailPage: React.FC = () => {
  const router = useRouter();
  const { ref } = useParams<{ ref: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { authenticated, token } = useAuthCheck();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const abortController = new AbortController();

    const fetchPayment = async () => {
      try {
        if (!authenticated || !token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${backendUrl}/payments/${ref}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: abortController.signal,
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Failed to fetch payment: ${response.status}`
          );
        }

        const data = await response.json();
        setPayment(data);
        setError(null);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching payment:", err);
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    if (authenticated && token) {
      fetchPayment();
    } else {
      setIsLoading(false);
    }

    return () => abortController.abort();
  }, [ref, authenticated, token, backendUrl, router]);

  if (!authenticated) {
    return (
      <AppLayout requireAuth>
        <div className="container py-8 animate-fade-in">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Please log in to view this payment
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requireAuth>
      <div className="container py-8 animate-fade-in">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            {error?.includes("401") && (
              <button
                onClick={() => router.push("/login")}
                className="ml-4 text-red-700 underline"
              >
                Login Again
              </button>
            )}
          </div>
        )}
        <PaymentDetail payment={payment} loading={isLoading} />
      </div>
    </AppLayout>
  );
};

export default PaymentDetailPage;
