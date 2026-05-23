"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wardApi } from "@/lib/api/ward.api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Hotel,
  Users,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Building,
  Activity,
  Calendar,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function WardDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const wardId = parseInt(id as string);

  // Query to fetch ward details
  const { data: ward, isLoading, isError } = useQuery({
    queryKey: ["ward", wardId],
    queryFn: () => wardApi.getById(wardId),
    select: (res) => res.data,
  });

  // Mutators for toggles
  const toggleLockMutation = useMutation({
    mutationFn: () => wardApi.toggleLock(wardId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ward", wardId] });
      toast.success(res.data.locked ? "Ward locked successfully" : "Ward unlocked successfully");
    },
    onError: () => {
      toast.error("Failed to toggle ward lock status");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: () => wardApi.toggleActive(wardId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ward", wardId] });
      toast.success(res.data.active ? "Ward activated successfully" : "Ward deactivated successfully");
    },
    onError: () => {
      toast.error("Failed to toggle ward active status");
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] col-span-1" />
          <Skeleton className="h-[400px] col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !ward) {
    return (
      <div className="text-center py-20 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900">Ward Not Found</h2>
        <p className="text-slate-500 mt-2">The ward you are looking for does not exist or has been decommissioned.</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.push("/admin/wards")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Wards
        </Button>
      </div>
    );
  }

  // Calculate occupancy rates
  const occupancyRate = ward.numberOfBeds > 0
    ? (ward.currentOccupancy / ward.numberOfBeds) * 100
    : 0;

  // Visual status configurations
  const isAtCapacity = ward.currentOccupancy >= ward.numberOfBeds;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/wards")} className="-ml-4 text-slate-500 hover:text-slate-800">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Wards
        </Button>
        <Link href={`/admin/wards/${ward.id}/edit`}>
          <Button className="shadow-sm">
            <Pencil className="mr-2 h-4 w-4" /> Edit Ward
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Profile & Badges */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-4 border border-blue-100">
                <Building className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">{ward.name}</h2>

              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Badge variant="secondary" className="text-[10px] uppercase font-semibold tracking-wider">
                  {ward.genderDesignation.split("_")[0].toLowerCase()} Only
                </Badge>
                <Badge className={ward.active ? "bg-emerald-500 text-white font-medium" : "bg-slate-300 text-slate-700"}>
                  {ward.active ? "Active" : "Inactive"}
                </Badge>
                {ward.locked && (
                  <Badge variant="destructive" className="flex items-center gap-1 font-medium">
                    <Lock className="h-3 w-3" /> Locked
                  </Badge>
                )}
              </div>

              <Separator className="my-6" />

              <div className="w-full space-y-4 text-left">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Details</h4>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Email</p>
                    <p className="text-sm font-semibold text-slate-800 break-all">{ward.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Phone Extension</p>
                    <p className="text-sm font-semibold text-slate-800">{ward.phone || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Detailed Capacity Metrics & Switches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Capacity Metrics Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                Live Capacity & Occupancy
              </CardTitle>
              <CardDescription>Real-time ward capacity tracking and occupancy statistics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Live Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Patients</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{ward.currentOccupancy}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Active admissions currently assigned.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed Capacity</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{ward.numberOfBeds}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Total bed allotment for this facility.</p>
                </div>
              </div>

              {/* Progress and status message */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-600">Occupancy Rate</span>
                  <span className={cn(
                    isAtCapacity ? "text-rose-600" : occupancyRate > 80 ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {occupancyRate.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={occupancyRate}
                  className="h-3"
                  indicatorClassName={cn(
                    isAtCapacity ? "bg-rose-500" : occupancyRate > 80 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                />
              </div>

              {isAtCapacity && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex gap-3 items-start">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Ward is at Maximum Capacity</p>
                    <p className="text-xs mt-0.5">This ward has reached its maximum bed limit. No new admissions can be scheduled until beds are vacated.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operational Settings Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Operational & Staffing Controls
              </CardTitle>
              <CardDescription>Configure ward states and assign nursing counts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Staff details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Assigned Nursing Staff</h4>
                  <p className="text-xs text-slate-500">Nurses currently designated to this ward.</p>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1 font-mono font-bold bg-white text-slate-800 border-slate-200 shadow-xs">
                  {ward.numberOfNurses} Nurses
                </Badge>
              </div>

              <Separator />

              {/* Reactive Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <span className="text-sm font-semibold text-slate-800">Operational Switch</span>
                    <p className="text-xs text-slate-500">Deactivating this ward hides it from available facilities and locks active admission flows.</p>
                  </div>
                  <Switch
                    checked={ward.active}
                    onCheckedChange={() => toggleActiveMutation.mutate()}
                    disabled={toggleActiveMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <span className="text-sm font-semibold text-slate-800">Admissions Lock</span>
                    <p className="text-xs text-slate-500">Locking this ward immediately suspends any new patient check-in or transfers into this facility.</p>
                  </div>
                  <Switch
                    checked={ward.locked}
                    onCheckedChange={() => toggleLockMutation.mutate()}
                    disabled={toggleLockMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
