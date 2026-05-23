"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PatientForm } from "@/components/forms/patient-form";
import { patientApi } from "@/lib/api/patient.api";
import { PatientValues } from "@/lib/validators/patient.schema";
import { Card, CardContent } from "@/components/ui/card";

export default function NewPatientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: PatientValues) => {
    setIsLoading(true);
    try {
      await patientApi.create(data);
      toast.success("Patient created successfully");
      router.push("/admin/patients");
    } catch (error: any) {
      const responseData = error.response?.data;
      // Note: form-level mapping is handled inside PatientForm if we pass a form reference, 
      // but since we keep the submit simple, displaying the error message is super robust.
      toast.error(responseData?.message || "Failed to create patient");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader 
        title="New Patient" 
        description="Add a new patient to the system."
      />

      <Card>
        <CardContent className="pt-6">
          <PatientForm 
            onSubmit={onSubmit}
            isLoading={isLoading}
            onCancel={() => router.push("/admin/patients")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
