"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wardApi } from "@/lib/api/ward.api";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Hotel, 
  Users, 
  Lock, 
  Unlock, 
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WardListPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: wards, isLoading, isError } = useQuery({
    queryKey: ["wards"],
    queryFn: wardApi.getAll,
  });

  // Mutators for toggle actions
  const toggleLockMutation = useMutation({
    mutationFn: (id: number) => wardApi.toggleLock(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast.success(res.data.locked ? "Ward locked successfully" : "Ward unlocked successfully");
    },
    onError: () => {
      toast.error("Failed to toggle ward lock status");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => wardApi.toggleActive(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast.success(res.data.active ? "Ward activated successfully" : "Ward deactivated successfully");
    },
    onError: () => {
      toast.error("Failed to toggle ward active status");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => wardApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      toast.success("Ward deleted successfully");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete ward");
    }
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Wards" 
        description="Monitor ward occupancy and manage hospital facilities."
        actions={
          <Link 
            href="/admin/wards/new" 
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> New Ward
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-[250px] w-full" />)}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive bg-white rounded-lg border">
          Failed to load wards.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(wards?.data.content ?? []).map((ward) => {
            const occupancyRate = (ward.currentOccupancy / ward.numberOfBeds) * 100;
            return (
              <Card key={ward.id} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold hover:text-primary transition-colors">
                      <Link href={`/admin/wards/${ward.id}`}>{ward.name}</Link>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {ward.genderDesignation}
                      </Badge>
                      <Badge className={ward.active ? "bg-green-500 hover:bg-green-600" : "bg-slate-300"}>
                        {ward.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" })
                      )}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href={`/admin/wards/${ward.id}`} className="flex items-center w-full">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/admin/wards/${ward.id}/edit`} className="flex items-center w-full">
                          <Pencil className="mr-2 h-4 w-4" /> Edit Ward
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => toggleLockMutation.mutate(ward.id)}
                        disabled={toggleLockMutation.isPending}
                      >
                        {ward.locked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                        {ward.locked ? "Unlock Ward" : "Lock Ward"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => toggleActiveMutation.mutate(ward.id)}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {ward.active ? <XCircle className="mr-2 h-4 w-4 text-amber-600" /> : <CheckCircle className="mr-2 h-4 w-4 text-green-600" />}
                        {ward.active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive cursor-pointer"
                        onClick={() => setDeleteId(ward.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Hotel className="h-4 w-4" /> Capacity
                    </span>
                    <span className="font-medium">{ward.currentOccupancy} / {ward.numberOfBeds} Beds</span>
                  </div>
                  <Progress value={occupancyRate} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="h-4 w-4" /> Nursing Staff
                    </span>
                    <span className="font-medium">{ward.numberOfNurses} Nurses</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t py-3 flex justify-between text-xs text-slate-500">
                  <span>Tel: {ward.phone || "N/A"}</span>
                  {ward.locked && (
                    <span className="flex items-center text-amber-600 font-medium">
                      <Lock className="h-3 w-3 mr-1" /> Locked
                    </span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the ward from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
