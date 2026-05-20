"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorApi } from "@/lib/api/doctor.api";
import { PageHeader } from "@/components/shared/page-header";
import { DoctorForm } from "@/components/forms/doctor-form";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function NewDoctorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => doctorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor created successfully");
      router.push("/admin/doctors");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create doctor");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="New Doctor" 
        description="Fill in the details to add a new doctor to the system."
      />

      <Card>
        <CardContent className="pt-6">
          <DoctorForm 
            onSubmit={(values) => mutation.mutate(values)} 
            isLoading={mutation.isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
