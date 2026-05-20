"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  resetPasswordRequestSchema, 
  resetPasswordVerifySchema,
  ResetPasswordRequestValues,
  ResetPasswordVerifyValues
} from "@/lib/validators/auth.schema";
import { authApi } from "@/lib/api/auth.api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const requestForm = useForm<ResetPasswordRequestValues>({
    resolver: zodResolver(resetPasswordRequestSchema),
  });

  const verifyForm = useForm<ResetPasswordVerifyValues>({
    resolver: zodResolver(resetPasswordVerifySchema),
    defaultValues: { email: "" }
  });

  const onRequestSubmit = async (data: ResetPasswordRequestValues) => {
    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(data.email);
      setEmail(data.email);
      verifyForm.setValue("email", data.email);
      toast.success("OTP sent to your email. It expires in 10 minutes.");
      setStep(2);
    } catch (error) {
      toast.error("Failed to request password reset. Please check the email and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (data: ResetPasswordVerifyValues) => {
    setIsLoading(true);
    try {
      await authApi.verifyPasswordReset(data);
      toast.success("Password reset successfully! You can now login.");
      router.push("/login");
    } catch (error) {
      toast.error("Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {step === 1 
              ? "Enter your email to receive a password reset code" 
              : `Enter the code sent to ${email} and your new password`}
          </CardDescription>
        </CardHeader>
        
        {step === 1 ? (
          <form onSubmit={requestForm.handleSubmit(onRequestSubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...requestForm.register("email")}
                  className={requestForm.formState.errors.email ? "border-destructive" : ""}
                />
                {requestForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{requestForm.formState.errors.email.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending Code..." : "Send Reset Code"}
              </Button>
              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="6-character code"
                  {...verifyForm.register("otp")}
                  className={verifyForm.formState.errors.otp ? "border-destructive" : ""}
                  maxLength={6}
                />
                {verifyForm.formState.errors.otp && (
                  <p className="text-sm text-destructive">{verifyForm.formState.errors.otp.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...verifyForm.register("newPassword")}
                  className={verifyForm.formState.errors.newPassword ? "border-destructive" : ""}
                />
                {verifyForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">{verifyForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...verifyForm.register("confirmPassword")}
                  className={verifyForm.formState.errors.confirmPassword ? "border-destructive" : ""}
                />
                {verifyForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{verifyForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Back to email entry
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
