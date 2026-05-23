"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { admissionsApi } from "@/lib/api/admissions.api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  Activity, 
  FileCheck2, 
  Stethoscope, 
  User, 
  Building, 
  LogOut,
  CheckCircle,
  FileText,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";

const dischargeSchema = z.object({
  diagnosisOnDischarge: z.string().min(5, "Discharge diagnosis must be at least 5 characters"),
  actualDischargeDate: z.string().min(1, "Discharge date is required"),
});

type DischargeValues = z.infer<typeof dischargeSchema>;

export default function AdmissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const admissionId = parseInt(id as string);

  const { data: admission, isLoading, isError } = useQuery({
    queryKey: ["admission", admissionId],
    queryFn: () => admissionsApi.getById(admissionId),
    select: (res) => res.data,
  });

  const form = useForm<DischargeValues>({
    resolver: zodResolver(dischargeSchema),
    defaultValues: {
      diagnosisOnDischarge: "",
      actualDischargeDate: new Date().toISOString().split("T")[0],
    },
  });

  const dischargeMutation = useMutation({
    mutationFn: (values: DischargeValues) => admissionsApi.discharge(admissionId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["admission", admissionId] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast.success("Patient discharged successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to discharge patient";
      toast.error(message);
    }
  });

  const handleDischargeSubmit = async (values: DischargeValues) => {
    await dischargeMutation.mutateAsync(values);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[300px] col-span-1" />
          <Skeleton className="h-[300px] col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !admission) {
    return (
      <div className="text-center py-20 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900">Admission Not Found</h2>
        <p className="text-slate-500 mt-2">The admission record you are looking for does not exist or has been removed.</p>
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={() => router.push("/admin/admissions")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admissions
        </Button>
      </div>
    );
  }

  // Calculate bed-days
  const calculateBedDays = () => {
    if (!admission.admissionDate) return 0;
    const start = parseISO(admission.admissionDate);
    const end = admission.actualDischargeDate 
      ? parseISO(admission.actualDischargeDate) 
      : new Date();
    const days = differenceInDays(end, start);
    return days <= 0 ? 1 : days; // Minimum 1 day
  };

  const isActive = admission.status === "ACTIVE";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Back Button */}
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.push("/admin/admissions")} className="-ml-4 text-slate-500 hover:text-slate-800">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admissions
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Hospitalization Core Card */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-4 border border-emerald-100">
                <FileCheck2 className="h-8 w-8" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Admission Record</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">ID: #{admission.id}</h2>

              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                  {admission.admissionType}
                </Badge>
                <Badge className={isActive ? "bg-emerald-500 text-white font-medium" : "bg-slate-300 text-slate-700"}>
                  {isActive ? "Active" : "Discharged"}
                </Badge>
              </div>

              <Separator className="my-6" />

              <div className="w-full space-y-4 text-left">
                {/* Patient details */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Patient</p>
                    <p className="text-sm font-bold text-slate-800">{admission.patientName}</p>
                    <p className="text-xs text-slate-400 font-mono">Patient ID: #{admission.patientId}</p>
                  </div>
                </div>

                {/* Doctor details */}
                <div className="flex items-start gap-3">
                  <Stethoscope className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Attending Doctor</p>
                    <p className="text-sm font-bold text-slate-800">{admission.doctorName}</p>
                    <p className="text-xs text-slate-400 font-mono">Doctor ID: #{admission.doctorId}</p>
                  </div>
                </div>

                {/* Ward details */}
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Ward Assignment</p>
                    <p className="text-sm font-bold text-slate-800">{admission.wardName}</p>
                    <p className="text-xs text-slate-400 font-mono">Ward ID: #{admission.wardId}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Case history / Diagnosis & Discharging Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Clinical Case Details */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Hospitalization History
              </CardTitle>
              <CardDescription>Primary admitting logs and timelines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Date Timelines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Admitted</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {new Date(admission.admissionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Discharge</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {admission.expectedDischargeDate 
                        ? new Date(admission.expectedDischargeDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnosis on Admission */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnosis on Admission</h4>
                <p className="text-sm text-slate-700 bg-slate-50/50 p-4 border border-dashed rounded-xl leading-relaxed whitespace-pre-wrap">
                  {admission.diagnosisOnAdmission}
                </p>
              </div>

              {/* Bed Days used */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Hospitalization Bed Days</h4>
                  <p className="text-xs text-slate-500">Calculated duration of stay in this ward.</p>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1 font-mono font-bold bg-white text-slate-800 border-slate-200 shadow-xs">
                  {calculateBedDays()} Bed Days
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Cards: Discharge Form OR Discharge Profile */}
          {isActive ? (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <LogOut className="h-5 w-5 text-amber-500" />
                  Active Discharge Portal
                </CardTitle>
                <CardDescription>Enter final diagnostic evaluations and discharge date to release the patient.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleDischargeSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="actualDischargeDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discharge Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="diagnosisOnDischarge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis on Discharge</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detail patient's physical/medical response, final diagnostic assessments, or check-out directives..." 
                              rows={3} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-2">
                      <Button 
                        type="submit" 
                        disabled={dischargeMutation.isPending}
                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      >
                        {dischargeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Discharge Patient
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-sm bg-emerald-50/10 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Discharge Summary
                </CardTitle>
                <CardDescription>Official checkout information and diagnostics.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date Checked Out</p>
                    <p className="text-sm font-bold text-slate-800">
                      {admission.actualDischargeDate 
                        ? new Date(admission.actualDischargeDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnosis on Discharge</h4>
                  <p className="text-sm text-slate-700 bg-white p-4 border rounded-xl leading-relaxed whitespace-pre-wrap">
                    {admission.diagnosisOnDischarge}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
