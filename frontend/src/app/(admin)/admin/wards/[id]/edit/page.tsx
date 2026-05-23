"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wardApi } from "@/lib/api/ward.api";
import { PageHeader } from "@/components/shared/page-header";
import { WardForm } from "@/components/forms/ward-form";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WardValues } from "@/lib/validators/ward.schema";

export default function EditWardPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const wardId = parseInt(id as string);

  const { data: ward, isLoading, isError } = useQuery({
    queryKey: ["ward", wardId],
    queryFn: () => wardApi.getById(wardId),
    select: (res) => res.data,
  });

  const mutation = useMutation({
    mutationFn: (data: WardValues) => wardApi.update(wardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ward", wardId] });
      toast.success("Ward updated successfully");
      router.push("/admin/wards");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !ward) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Ward not found</h2>
        <p className="text-slate-500 mt-2">The ward you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader 
        title={`Edit Ward: ${ward.name}`} 
        description="Update ward configuration, capacity, or nursing staff details."
      />

      <Card>
        <CardContent className="pt-6">
          <WardForm 
            initialData={ward}
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
