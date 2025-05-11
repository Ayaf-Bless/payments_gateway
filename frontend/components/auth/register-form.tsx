"use client";
import React, { useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  password: z.string().min(8, {
    message:
      "Password must be at least 8 characters with uppercase, lowercase, numbers and symbols",
  }),
  website: z.string().optional(), // Honeypot field
  submittedAt: z.string(), // Timestamp for anti-bot validation
});

type RegisterValues = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      website: "", // Honeypot field should be empty
      submittedAt: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    // Set the submission timestamp right before submitting
    values.submittedAt = new Date().toISOString();

    setLoading(true);

    try {
      // Honeypot check on client side - if website field is filled, it's likely a bot
      if (values.website) {
        // Simulate successful submission but don't actually submit
        // This deceives bots into thinking their submission worked
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast({
          title: "Successful Registration",
          description: "Your account has been created successfully.",
          variant: "default", // You can define a 'destructive' variant in your Toast component for error styling
        });
        return;
      }

      // Actual submission to Next.js API route
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          password: values.password,
          submittedAt: values.submittedAt,
        }),
        credentials: "include", // Important for cookies to be sent and received
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Registration Error",
          description: data.message || "An error occurred during registration.",
          variant: "destructive", // You can define a 'destructive' variant in your Toast component for error styling
        });
        return;
      }

      toast({
        title: "Successful Registration, Redirecting to Login",
        description: "Your account has been created successfully.",
        variant: "default", // You can define a 'destructive' variant in your Toast component for error styling
      });

      // Short delay before redirecting for better UX
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Submission Error, Please try again",
        description: "There was an error creating your account.",
        variant: "destructive", // You can define a 'destructive' variant in your Toast component for error styling
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-dfcuBlue">
          Create an Account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your details to create your dfcu SwiftPay account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Honeypot field - hidden from regular users */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem style={{ display: "none" }}>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" tabIndex={-1} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-dfcuGreen hover:bg-green-700"
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
                  Processing...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-dfcuBlue hover:text-dfcuGreen font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
