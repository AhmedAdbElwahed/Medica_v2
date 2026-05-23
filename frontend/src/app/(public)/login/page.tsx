"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginValues } from "@/lib/validators/auth.schema";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, Heart, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Login successful!");
        router.refresh();
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── Left Brand Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #007A8A 0%, #005f6e 40%, #2C3E50 100%)",
        }}
      >
        {/* Decorative blurred blobs */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "#4CAF93" }}
        />
        <div
          className="absolute bottom-0 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "#A2D8E6" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 blur-2xl"
          style={{ background: "#4CAF93" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div
            className="flex w-fit items-center gap-3 "
          >
            <Image
              src="/hms_logo.png"
              alt="Medica HMS logo"
              width={150}
              height={150}
              className="object-contain brightness-0 invert"
              priority
            />
          </div>

          {/* Hero text */}
          <div className="flex flex-1 flex-col">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Healthcare
              <br />
              <span style={{ color: "#A2D8E6" }}>Reimagined.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-sm leading-relaxed">
              A unified platform for managing patients, appointments, clinical
              records, and billing — all in one place.
            </p>

            {/* Feature pills */}
            <div className="mt-10 flex flex-col gap-4">
              {[
                { icon: Activity, label: "Real-time patient monitoring" },
                { icon: Shield, label: "HIPAA-compliant & secure" },
                { icon: Heart, label: "Seamless care coordination" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-white/80 font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Medica HMS. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div
        className="flex w-full lg:w-1/2 xl:w-[45%] flex-col items-center justify-center px-6 sm:px-12 lg:px-16 overflow-y-auto"
        style={{ background: "#E1E8ED" }}
      >
        {/* Mobile logo (only visible below lg) */}
        <div className="mb-8 flex items-center justify-center lg:hidden">
          <Image
            src="/hms_logo.png"
            alt="Medica HMS logo"
            width={140}
            height={48}
            className="object-contain"
            priority
          />
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-3xl font-bold tracking-tight mb-1"
              style={{ color: "#2C3E50" }}
            >
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: "#4E7D96" }}>
              Sign in to your Medica account to continue
            </p>
          </div>

          {/* Form card */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl bg-white shadow-sm border px-8 py-8 flex flex-col gap-5"
            style={{ borderColor: "#A2D8E6" }}
          >
            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold"
                style={{ color: "#2C3E50" }}
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                {...register("email")}
                className={cn(
                  "h-11 rounded-lg border bg-white px-4 text-sm transition-all",
                  "focus-visible:ring-2 focus-visible:ring-offset-0",
                  errors.email
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : "border-[#A2D8E6] focus-visible:ring-[#007A8A]/25 focus-visible:border-[#007A8A]"
                )}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold"
                  style={{ color: "#2C3E50" }}
                >
                  Password
                </Label>
                <Link
                  href="/reset-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#007A8A" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className={cn(
                    "h-11 rounded-lg border bg-white px-4 pr-11 text-sm transition-all",
                    "focus-visible:ring-2 focus-visible:ring-offset-0",
                    errors.password
                      ? "border-destructive focus-visible:ring-destructive/30"
                      : "border-[#A2D8E6] focus-visible:ring-[#007A8A]/25 focus-visible:border-[#007A8A]"
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4E7D96] hover:text-[#007A8A] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "mt-1 h-11 w-full rounded-lg text-sm font-semibold text-white transition-all",
                "hover:brightness-110 active:scale-[0.98]"
              )}
              style={{ background: "#007A8A" }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Register link */}
          <p
            className="mt-6 text-center text-sm"
            style={{ color: "#4E7D96" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: "#007A8A" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
