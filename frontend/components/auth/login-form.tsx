"use client";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  username: z.string().optional(), // Honeypot field
  submittedAt: z.string(), // Timestamp for anti-bot validation
});

type LoginValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "", // Honeypot field should be empty
      submittedAt: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    // Set the submission timestamp right before submitting
    values.submittedAt = new Date().toISOString();

    setLoading(true);

    try {
      // Honeypot check on client side - if username field is filled, it's likely a bot
      if (values.username) {
        // Simulate successful submission but don't actually submit
        // This deceives bots into thinking their submission worked
        await new Promise((resolve) => setTimeout(resolve, 1500));

        router.push("/");
        return;
      }

      // Actual submission to Next.js API route
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          submittedAt: values.submittedAt,
        }),
        credentials: "include", // Important for cookies to be sent and received
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Login failed",
          description: data.message || "Invalid username or password.",
          variant: "destructive", // You can define a 'destructive' variant in your Toast component for error styling
        });
        return;
      }

      toast({
        title: "Login successful",
        description: "You have been successfully logged in.",
      });
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
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
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your dfcu SwiftPay account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Honeypot field - hidden from regular users */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem style={{ display: "none" }}>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" tabIndex={-1} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-dfcuBlue hover:text-dfcuGreen"
              >
                Forgot password?
              </Link>
            </div>

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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Dont have an account?{" "}
          <Link
            href="/register"
            className="text-dfcuBlue hover:text-dfcuGreen font-medium"
          >
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
