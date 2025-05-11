"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Copy, Download, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Payment } from "@/interfaces";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface PaymentDetailProps {
  payment: Payment | null;
  loading?: boolean;
}

const PaymentDetail: React.FC<PaymentDetailProps> = ({ payment, loading }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Loading payment details...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dfcuGreen"></div>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-destructive">
            Payment Not Found
          </CardTitle>
          <CardDescription>
            The requested payment details could not be found
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <p className="text-muted-foreground">
            This transaction may have been deleted or the ID is incorrect.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/payments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Format date to readable format

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "SUCCESSFUL":
        return "badge-success";
      case "PENDING":
        return "badge-pending";
      case "FAILED":
        return "badge-error";
      default:
        return "badge-pending";
    }
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(payment.id);
    toast({
      title: "Copied to clipboard",
      description: "Payment reference copied successfully",
      variant: "default",
    });
  };

  const handleDownloadReceipt = () => {
    setIsDownloading(true);

    // Simulate API delay for downloading receipt
    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "Receipt Downloaded",
        description: "Your receipt has been downloaded successfully",
        variant: "default",
      });
    }, 1500);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/payments")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
            {payment.status}
          </span>
        </div>
        <CardTitle className="text-xl mt-4">Payment Details</CardTitle>
        <CardDescription>
          Transaction reference:{" "}
          <span className="font-mono">{payment.transactionRef}</span>
          <Button
            onClick={handleCopyReference}
            variant="ghost"
            size="sm"
            className="ml-2 h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
            <span className="sr-only">Copy reference</span>
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">
              Amount
            </h3>
            <p className="text-2xl font-bold">
              {payment.amount.toLocaleString()} {payment.currency}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">
              Date
            </h3>
            <p>{formatDate(new Date(payment.createdAt))}</p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium mb-3">Transaction Details</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-medium">{payment.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Transaction Type</dt>
              <dd className="font-medium capitalize">{payment.type}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">From</dt>
              <dd className="font-medium">{payment.payer}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">To</dt>
              <dd className="font-medium">{payment.payee}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t p-6">
        <Button
          variant="outline"
          className="w-full sm:w-auto flex items-center"
          onClick={handleDownloadReceipt}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </>
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive/10"
            >
              Report Issue
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Report an issue with this payment?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will alert our support team to investigate this
                transaction. A representative will contact you within 24 hours.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  toast({
                    title: "Issue Reported",
                    description: "Your issue has been reported successfully.",
                    variant: "default",
                  })
                }
                className="bg-destructive hover:bg-destructive/90"
              >
                Report Issue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default PaymentDetail;
