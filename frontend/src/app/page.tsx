"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user) {
      switch (session.user.role) {
        case "ROLE_ADMIN":
          router.push("/admin/dashboard");
          break;
        case "ROLE_DOCTOR":
          router.push("/doctor/dashboard");
          break;
        case "ROLE_PATIENT":
          router.push("/patient/dashboard");
          break;
        default:
          router.push("/login");
      }
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
