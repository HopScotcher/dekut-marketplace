"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { registerSchema, type RegisterFormData } from "@/lib/validations";
// import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator'
import { toast } from "sonner";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      location: "",
    },
  });

  const passwordValue = form.watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const { registerUser } = await import("@/services/authService");

      // Call backend API - tokens are automatically stored by authService
      const response = await registerUser({
        userName: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phone || "",
        location: data.location,
      });

      toast.success("Account created successfully!", {
        description: `Welcome, ${response.user.name}! You're now logged in.`,
      });

      // Auto-login successful - redirect to home or dashboard
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Registration error:", error);

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
            } else if (field === "phonenumber" || field === "phone") {
              form.setError("phone", { message: err.message });
            } else if (field === "username" || field === "name") {
              form.setError("name", { message: err.message });
            }
          });
        }
      }

      // Handle general error messages
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";

      if (errorMessage?.toLowerCase().includes("already")) {
        toast.error("Account already exists", {
          description:
            "An account with this email already exists. Please sign in instead.",
        });
      } else if (errorMessage?.toLowerCase().includes("phone")) {
        toast.error("Invalid phone number", {
          description:
            "Please use Kenyan format: +254712345678 or +254112345678",
        });
      } else {
        toast.error("Registration failed", {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in the form below to get started</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    // placeholder="Enter your full name"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    // placeholder="Enter your email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+254712345678"
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      // placeholder="Enter your location"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                      // placeholder="Create a password"
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
                {/* <PasswordStrengthIndicator password={passwordValue} /> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      // placeholder="Confirm your password"
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
