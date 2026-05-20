"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function VerifyEmailOtpPage() {
  const { otp } = useParams() as { otp: string };
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        await authApi.activate(otp);
        toast.success("Account activated successfully! You can now login.");
        router.push("/login");
      } catch (error) {
        toast.error("Invalid or expired verification link.");
        setIsVerifying(false);
      }
    };

    if (otp) {
      verify();
    }
  }, [otp, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Verifying Your Email</CardTitle>
          <CardDescription>
            Please wait while we activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          {isVerifying ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
            <div className="space-y-4">
              <p className="text-destructive font-medium">Verification Failed</p>
              <button 
                onClick={() => router.push("/verify-email")}
                className="text-primary hover:underline"
              >
                Try manual entry
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
