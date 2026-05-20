"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorApi, DoctorFilters } from "@/lib/api/doctor.api";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Pencil, 
  Trash2, 
  FilterX,
  Stethoscope,
  Loader2
} from "lucide-react";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Specialty } from "@/types/doctor.types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SPECIALTIES: Specialty[] = [
  "GENERAL_PRACTICE", "PEDIATRICS", "CARDIOLOGY", "NEUROLOGY",
  "ONCOLOGY", "ORTHOPEDICS", "DERMATOLOGY", "PSYCHIATRY",
  "OPHTHALMOLOGY", "RADIOLOGY", "GINECOLOGY", "UROLOGY",
  "GASTROENTEROLOGY", "PULMONOLOGY"
];

export default function DoctorListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const [specialty, setSpecialty] = useState<Specialty | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filters: DoctorFilters = {
    name: debouncedSearch || undefined,
    specialty: specialty === "ALL" ? undefined : specialty,
    page,
    size
  };

  const { data: doctorsPage, isLoading, isError } = useQuery({
    queryKey: ["doctors", filters],
    queryFn: () => doctorApi.getAll(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => doctorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor deleted successfully");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete doctor");
    }
  });

  const totalPages = doctorsPage?.data.totalPages ?? 0;

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Doctors" 
        description="Manage medical staff, their specialties and schedules."
        actions={
          <Link 
            href="/admin/doctors/new" 
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> New Doctor
          </Link>
        }
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select 
            value={specialty} 
            onValueChange={(v) => setSpecialty(v as any)}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Specialties</SelectItem>
              {SPECIALTIES.map(s => (
                <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search || specialty !== "ALL") && (
            <Button variant="ghost" onClick={() => { setSearch(""); setSpecialty("ALL"); }} className="text-slate-500">
              <FilterX className="mr-2 h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>License #</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-destructive">
                  Failed to load doctors. Please try again.
                </TableCell>
              </TableRow>
            ) : doctorsPage?.data.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No doctors found.
                </TableCell>
              </TableRow>
            ) : (
              doctorsPage?.data.content.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</span>
                        <span className="text-xs text-slate-500">{doctor.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                      {doctor.specialty.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{doctor.licenseNumber}</TableCell>
                  <TableCell>{doctor.yearsOfExperience} years</TableCell>
                  <TableCell className="text-sm">
                    {doctor.workStartTime} - {doctor.workEndTime}
                  </TableCell>
                  <TableCell>
                    <Badge className={doctor.activeStatus ? "bg-green-500" : "bg-slate-300"}>
                      {doctor.activeStatus ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
                          <Link href={`/admin/doctors/${doctor.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/admin/doctors/${doctor.id}/edit`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Doctor
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer"
                          onClick={() => setDeleteId(doctor.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 0) setPage(page - 1);
                    }}
                    className={page === 0 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href="#" 
                      isActive={page === i}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages - 1) setPage(page + 1);
                    }}
                    className={page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the doctor from the system.
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
