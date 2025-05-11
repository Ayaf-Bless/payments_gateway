"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import { UserProfile } from "@/interfaces";

export interface Transaction {
  id: string;
  createdAt: Date;
  type: "incoming" | "outgoing";
  amount: number;
  currency: string;
  payee: string;
  status: "completed" | "pending" | "failed";
  transactionRef: string;
  payeeName: string;
  payerName: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  title: string;
  description: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title,
  description,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const userAccountNumber = userProfile?.accountNumber;

  useEffect(() => {
    const user = localStorage.getItem("userProfile");
    if (user) {
      setUserProfile(JSON.parse(user));
    }
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "SUCCESSFUL":
        return "badge-success";
      case "PENDING":
        return "badge-pending";
      case "failed".toUpperCase():
        return "badge-error";
      default:
        return "badge-pending";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      transaction.type === "incoming"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">
                      {transaction.payee === userAccountNumber ? (
                        <span className="font-bold">You</span>
                      ) : (
                        <>
                          <span className="font-bold">
                            {transaction.payeeName}
                          </span>{" "}
                          <span className="text-sm">{transaction.payee}</span>
                        </>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(transaction.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        transaction.type === "incoming" ? "text-green-600" : ""
                      }`}
                    >
                      {transaction.type === "incoming" ? "+" : ""}
                      {transaction.amount.toLocaleString()}{" "}
                      {transaction.currency}
                    </p>
                    <span
                      className={`badge ${getStatusBadgeClass(
                        transaction.status
                      )}`}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/payments/${transaction.transactionRef}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No transactions yet.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button asChild variant="outline" className="w-full">
          <Link href="/payments">View All Transactions</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransactionList;
