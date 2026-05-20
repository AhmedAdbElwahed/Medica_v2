"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorApi } from "@/lib/api/doctor.api";
import { PageHeader } from "@/components/shared/page-header";
import { DoctorForm } from "@/components/forms/doctor-form";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditDoctorPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const doctorId = parseInt(id as string);

  const { data: doctor, isLoading, isError } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => doctorApi.getById(doctorId),
    select: (res) => res.data,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => doctorApi.update(doctorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", doctorId] });
      toast.success("Doctor updated successfully");
      router.push("/admin/doctors");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update doctor");
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

  if (isError || !doctor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Doctor not found</h2>
        <p className="text-slate-500 mt-2">The doctor you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Edit Dr. ${doctor.firstName} ${doctor.lastName}`} 
        description="Update professional details and work schedule."
      />

      <Card>
        <CardContent className="pt-6">
          <DoctorForm 
            initialData={doctor}
            onSubmit={(values) => mutation.mutate(values)} 
            isLoading={mutation.isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
