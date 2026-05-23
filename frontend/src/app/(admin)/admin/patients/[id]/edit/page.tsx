"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientApi } from "@/lib/api/patient.api";
import { PageHeader } from "@/components/shared/page-header";
import { PatientForm } from "@/components/forms/patient-form";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientValues } from "@/lib/validators/patient.schema";

export default function EditPatientPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const patientId = parseInt(id as string);

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientApi.getById(patientId),
    select: (res) => res.data,
  });

  const mutation = useMutation({
    mutationFn: (data: PatientValues) => patientApi.update(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      toast.success("Patient updated successfully");
      router.push(`/admin/patients/${patientId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update patient");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Patient not found</h2>
        <p className="text-slate-500 mt-2">The patient you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader 
        title={`Edit Patient: ${patient.firstName} ${patient.lastName}`} 
        description="Update contact information, insurance, or medical details."
      />

      <Card>
        <CardContent className="pt-6">
          <PatientForm 
            initialData={patient}
            onSubmit={(values) => mutation.mutateAsync(values)} 
            isLoading={mutation.isPending} 
            onCancel={() => router.push(`/admin/patients/${patientId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
