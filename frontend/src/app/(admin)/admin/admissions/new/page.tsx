"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { admissionsApi } from "@/lib/api/admissions.api";
import { patientApi } from "@/lib/api/patient.api";
import { doctorApi } from "@/lib/api/doctor.api";
import { wardApi } from "@/lib/api/ward.api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, AlertTriangle, Building, Bed } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { admissionSchema, AdmissionValues } from "@/lib/validators/admission.schema";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function NewAdmissionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);

  // Queries to load patients, doctors, and wards
  const { data: patientsPage, isLoading: isPatientsLoading } = useQuery({
    queryKey: ["patients", { size: 100 }],
    queryFn: () => patientApi.getAll({ size: 100 }),
  });

  const { data: doctorsPage, isLoading: isDoctorsLoading } = useQuery({
    queryKey: ["doctors", { size: 100 }],
    queryFn: () => doctorApi.getAll({ size: 100 }),
  });

  const { data: wardsPage, isLoading: isWardsLoading } = useQuery({
    queryKey: ["wards"],
    queryFn: () => wardApi.getAll(),
  });

  const patients = patientsPage?.data.content ?? [];
  const doctors = doctorsPage?.data.content ?? [];
  const wards = wardsPage?.data.content ?? [];

  const form = useForm<AdmissionValues>({
    resolver: zodResolver(admissionSchema) as any,
    defaultValues: {
      patientId: undefined,
      doctorId: undefined,
      wardId: undefined,
      admissionType: "GENERAL",
      diagnosisOnAdmission: "",
      admissionDate: new Date().toISOString().split("T")[0],
      expectedDischargeDate: "",
    },
  });

  // Watch for selected Ward to apply Capacity Guards
  const wardIdValue = form.watch("wardId");
  useEffect(() => {
    if (wardIdValue) {
      setSelectedWardId(Number(wardIdValue));
    } else {
      setSelectedWardId(null);
    }
  }, [wardIdValue]);

  const selectedWard = wards.find(w => w.id === selectedWardId);
  const isWardFull = selectedWard ? selectedWard.currentOccupancy >= selectedWard.numberOfBeds : false;
  const isWardLocked = selectedWard ? selectedWard.locked : false;
  const isWardInactive = selectedWard ? !selectedWard.active : false;
  const cannotAdmit = isWardFull || isWardLocked || isWardInactive;

  const mutation = useMutation({
    mutationFn: (data: AdmissionValues) => {
      // Map standard CreateAdmissionDto
      const requestData = {
        ...data,
        expectedDischargeDate: data.expectedDischargeDate || undefined,
      };
      return admissionsApi.create(requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast.success("Patient admitted successfully");
      router.push("/admin/admissions");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to admit patient";
      toast.error(message);
    }
  });

  const onSubmit = async (values: AdmissionValues) => {
    if (cannotAdmit) {
      toast.error("Cannot proceed: Selected ward is unavailable or at full capacity.");
      return;
    }
    await mutation.mutateAsync(values);
  };

  const isLoadingChoices = isPatientsLoading || isDoctorsLoading || isWardsLoading;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader 
        title="New Admission" 
        description="Fill out the forms below to register a patient hospitalization."
      />

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          {isLoadingChoices ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              <p className="text-slate-500 font-medium text-sm">Loading dropdown options...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Select Patient */}
                  <FormField
                    control={form.control as any}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(Number(val))} 
                          value={field.value ? String(field.value) : ""}
                          items={patients.map((p) => ({
                            value: String(p.id),
                            label: `${p.firstName} ${p.lastName} (ID: #${p.id})`,
                          }))}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select patient..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.firstName} {p.lastName} (ID: #{p.id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Select Doctor */}
                  <FormField
                    control={form.control as any}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attending Doctor</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(Number(val))} 
                          value={field.value ? String(field.value) : ""}
                          items={doctors.map((d) => ({
                            value: String(d.id),
                            label: `Dr. ${d.firstName} ${d.lastName} (${d.specialty.replace("_", " ")})`,
                          }))}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select doctor..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctors.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>
                                Dr. {d.firstName} {d.lastName} ({d.specialty.replace("_", " ")})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Select Ward */}
                  <FormField
                    control={form.control as any}
                    name="wardId"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Ward Assignment</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(Number(val))} 
                          value={field.value ? String(field.value) : ""}
                          items={wards.map((w) => ({
                            value: String(w.id),
                            label: `${w.name} (${w.genderDesignation.toLowerCase().split("_")[0]} Only • ${w.currentOccupancy}/${w.numberOfBeds} Beds)`,
                          }))}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select ward..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wards.map((w) => (
                              <SelectItem key={w.id} value={String(w.id)}>
                                {w.name} ({w.genderDesignation} Designation • {w.currentOccupancy}/{w.numberOfBeds} Beds)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Assign patient to a ward. Wards at maximum capacity or locked cannot accept new patients.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Live Capacity Guard Display */}
                  {selectedWard && (
                    <div className={cn(
                      "col-span-1 md:col-span-2 p-4 rounded-xl border flex gap-3 items-start",
                      cannotAdmit 
                        ? "bg-rose-50 border-rose-200 text-rose-800" 
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    )}>
                      {cannotAdmit ? (
                        <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <Building className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-sm">Ward Status: {selectedWard.name}</h4>
                        <div className="text-xs space-y-1 mt-1">
                          <p className="flex items-center gap-1.5 font-medium">
                            <Bed className="h-3.5 w-3.5" />
                            Occupancy: <span className="font-bold">{selectedWard.currentOccupancy} / {selectedWard.numberOfBeds} Beds filled</span>
                          </p>
                          {isWardFull && (
                            <p className="text-rose-600 font-bold">⚠️ Warning: Ward has reached maximum occupancy. No beds available.</p>
                          )}
                          {isWardLocked && (
                            <p className="text-rose-600 font-bold">🔒 Warning: Ward is Locked by administrators. Admissions suspended.</p>
                          )}
                          {isWardInactive && (
                            <p className="text-rose-600 font-bold">🚫 Warning: Ward is marked Inactive. Admissions suspended.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admission Type */}
                  <FormField
                    control={form.control as any}
                    name="admissionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          items={[
                            { value: "GENERAL", label: "General Admission" },
                            { value: "URGENT", label: "Urgent / ICU Admission" },
                          ]}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GENERAL">General Admission</SelectItem>
                            <SelectItem value="URGENT">Urgent / ICU Admission</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Admission Date */}
                  <FormField
                    control={form.control as any}
                    name="admissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Expected Discharge Date */}
                  <FormField
                    control={form.control as any}
                    name="expectedDischargeDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Discharge (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Diagnosis on Admission */}
                  <FormField
                    control={form.control as any}
                    name="diagnosisOnAdmission"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Diagnosis on Admission</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe primary symptoms and clinical diagnosis on admission..." 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>

                <div className="flex justify-end gap-4 border-t pt-6">
                  <Button variant="outline" type="button" onClick={() => router.push("/admin/admissions")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending || cannotAdmit}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Admission
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
