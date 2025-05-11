"use client";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuthCheck } from "@/hooks/useAuthCheck"; // Assuming you have this hook
import { toast } from "@/hooks/use-toast";

const paymentSchema = z.object({
  payer: z
    .string()
    .min(10, { message: "account number must be at least 10 characters" })
    .regex(/^\d+$/, { message: "account number must contain only digits" }),
  payee: z
    .string()
    .min(10, { message: "account number must be at least 10 characters" })
    .regex(/^\d+$/, { message: "account number must contain only digits" }),
  amount: z.number().min(0.01, { message: "Amount must be greater than 0" }),
  currency: z.string().min(1, { message: "Please select a currency" }),
  payerReference: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const CreatePaymentForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { authenticated, loading: authLoading, token } = useAuthCheck();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payer: "",
      payee: "",
      amount: 0,
      currency: "UGX",
      payerReference: "",
    },
  });

  // Populate payer field with user's account number from localStorage
  useEffect(() => {
    try {
      const userProfile = JSON.parse(
        localStorage.getItem("userProfile") || "{}"
      );
      if (userProfile.accountNumber) {
        form.setValue("payer", userProfile.accountNumber);
      }
    } catch (error) {
      console.error("Error retrieving user profile:", error);
    }
  }, [form]);

  // Handle amount field as string in the UI, but convert to number for validation
  const amountValue = form.watch("amount");

  const onSubmit = async (values: PaymentFormValues) => {
    if (!authenticated || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // Security: Validate all inputs on client-side before sending to server
      if (
        !values.payer ||
        !values.payee ||
        values.amount <= 0 ||
        !values.currency ||
        !values.payerReference
      ) {
        throw new Error("All fields are required");
      }

      // Make API call to backend
      const response = await fetch(`${backendUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payer: values.payer,
          payee: values.payee,
          amount: values.amount,
          currency: values.currency,
          payerReference: values.payerReference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment failed");
      }

      const responseData = await response.json();

      // Success notification
      toast({
        title: "Payment Successful",
        description: `Payment of ${values.amount} ${values.currency} to ${values.payee} was successful.`,
        variant: "default",
      });

      // Add to payment history in localStorage for client-side use
      const existingPayments = JSON.parse(
        localStorage.getItem("payments") || "[]"
      );

      const newPayment = {
        id: responseData.transactionRef || responseData.id,
        date: new Date().toISOString(),
        type: "outgoing",
        amount: values.amount,
        currency: values.currency,
        recipient: values.payee,
        status: "completed",
        reference: values.payerReference,
        payer: values.payer,
      };

      localStorage.setItem(
        "payments",
        JSON.stringify([newPayment, ...existingPayments])
      );

      router.push("/payments");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error?.message || "An error occurred while processing payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If authentication is loading, show loading state
  if (authLoading) {
    return (
      <div className="w-full max-w-lg flex items-center justify-center p-8">
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!authenticated && !authLoading) {
    router.push("/login");
    return null;
  }

  return (
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader>
        <CardTitle>Create New Payment</CardTitle>
        <CardDescription>
          Enter the payment details to complete your transaction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="payer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="0712345678" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="0787654321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="100.50"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : parseFloat(value));
                        }}
                        value={amountValue === 0 ? "" : amountValue}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UGX">
                          UGX - Ugandan Shilling
                        </SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payerReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="INV-2023-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-dfcuGreen hover:bg-green-700 mt-4"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Processing payment...
                </span>
              ) : (
                "Complete Payment"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground">
        By completing this payment, you agree to our{" "}
        <a href="#" className="text-dfcuBlue hover:text-dfcuGreen">
          Terms of Service
        </a>
      </CardFooter>
    </Card>
  );
};

export default CreatePaymentForm;
