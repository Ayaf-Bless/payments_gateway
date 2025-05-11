"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Payment } from "@/interfaces";
import { formatDate } from "@/lib/utils";

interface PaymentListProps {
  payments: Payment[];
}

const PaymentList: React.FC<PaymentListProps> = ({ payments }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;

  // Apply filters
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.payerReference
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Payment History</CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-4 md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by recipient, reference or ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {currentPayments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Reference</th>
                    <th className="p-3 font-medium">Recipient</th>
                    <th className="p-3 font-medium text-right">Amount</th>
                    <th className="p-3 font-medium text-center">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30">
                      <td className="p-3 text-sm">
                        {formatDate(new Date(payment.createdAt))}
                      </td>
                      <td className="p-3 text-sm">{payment.transactionRef}</td>
                      <td className="p-3 text-sm">{payment.payee}</td>
                      <td className="p-3 text-sm text-right">
                        {payment.type === "incoming" ? "+" : ""}
                        {payment.amount.toLocaleString()} {payment.currency}
                      </td>
                      <td className="p-3 text-sm text-center">
                        <span
                          className={`badge ${getStatusBadgeClass(
                            payment.status
                          )}`}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/payments/${payment.transactionRef}`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstPayment + 1} to{" "}
                  {Math.min(indexOfLastPayment, filteredPayments.length)} of{" "}
                  {filteredPayments.length} payments
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No payment records found
            </p>
            <Button asChild className="bg-dfcuGreen hover:bg-green-700">
              <Link href="/payments/create">Create New Payment</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentList;
