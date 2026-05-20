"use client";

import { authApi } from "@/lib/api/auth.api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-character code");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.activate(otp);
      toast.success("Account activated successfully! You can now login.");
      router.push("/login");
    } catch (error: any) {
      toast.error("Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-character code sent to your email address to activate your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="ABC123"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl tracking-widest uppercase font-mono"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? "Verifying..." : "Verify Account"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive a code?{" "}
              <button 
                type="button" 
                className="font-medium text-primary hover:underline"
                onClick={() => toast.info("Resend functionality pending backend implementation")}
              >
                Resend Code
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
