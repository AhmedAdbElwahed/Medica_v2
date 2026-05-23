"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wardApi } from "@/lib/api/ward.api";
import { PageHeader } from "@/components/shared/page-header";
import { WardForm } from "@/components/forms/ward-form";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { WardValues } from "@/lib/validators/ward.schema";

export default function NewWardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: WardValues) => wardApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast.success("Ward created successfully");
      router.push("/admin/wards");
    },
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader 
        title="New Ward" 
        description="Add a new ward/facility to the hospital management system."
      />

      <Card>
        <CardContent className="pt-6">
          <WardForm 
            onSubmit={async (values) => {
              await mutation.mutateAsync(values);
            }} 
            isLoading={mutation.isPending} 
            onCancel={() => router.push("/admin/wards")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
