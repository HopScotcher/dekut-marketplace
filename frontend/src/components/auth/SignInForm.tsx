"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInSchema, type SignInFormData } from "@/lib/validations";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";
import { toast } from "sonner";

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    try {
      const { loginUser } = await import("@/services/authService");

      // Call backend API - tokens are automatically stored by authService
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });

      toast.success("Welcome back!", {
        description: `Signed in as ${response.user.name}`,
      });

      // Redirect to callback URL or home
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      console.error("Sign in error:", error);

      // Handle backend validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        // Set field-specific errors from backend
        if (Array.isArray(errors)) {
          errors.forEach((err: any) => {
            const field = err.field?.toLowerCase();
            if (field === "email") {
              form.setError("email", { message: err.message });
            } else if (field === "password") {
              form.setError("password", { message: err.message });
            }
          });
        }
      }

      // Handle general error messages
      const errorMessage = error.response?.data?.message || error.message;

      if (
        errorMessage?.toLowerCase().includes("incorrect") ||
        errorMessage?.toLowerCase().includes("invalid")
      ) {
        toast.error("Invalid credentials", {
          description: "Please check your email and password and try again.",
        });
      } else if (errorMessage?.toLowerCase().includes("locked")) {
        toast.error("Account locked", {
          description: "Your account has been locked. Please try again later.",
        });
      } else {
        toast.error("Sign in failed", {
          description:
            errorMessage || "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
                    placeholder="Enter your email"
                    disabled={isLoading}
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div></div>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setShowForgotPassword(true)}
              disabled={isLoading}
              className="px-0 font-normal"
            >
              Forgot password?
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  );
}
