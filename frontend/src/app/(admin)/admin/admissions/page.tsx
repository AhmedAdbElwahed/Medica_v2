"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { admissionsApi, AdmissionFilters } from "@/lib/api/admissions.api";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
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
  MoreVertical, 
  Eye, 
  LogOut,
  Hospital,
  Activity
} from "lucide-react";
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

export default function AdmissionsListPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const filters: AdmissionFilters = {
    page,
    size
  };

  const { data: admissionsPage, isLoading, isError } = useQuery({
    queryKey: ["admissions", filters],
    queryFn: () => admissionsApi.getAll(filters),
  });

  const totalPages = admissionsPage?.data.totalPages ?? 0;
  const admissions = admissionsPage?.data.content ?? [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Admissions" 
        description="Track active ward occupancy and manage patient hospitalizations."
        actions={
          <Link 
            href="/admin/admissions/new" 
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> New Admission
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/75 border-b">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Patient</TableHead>
              <TableHead className="font-semibold text-slate-600">Assigned Doctor</TableHead>
              <TableHead className="font-semibold text-slate-600">Ward</TableHead>
              <TableHead className="font-semibold text-slate-600">Admission Type</TableHead>
              <TableHead className="font-semibold text-slate-600">Date Admitted</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
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
                <TableCell colSpan={7} className="text-center py-10 text-destructive font-medium bg-slate-50/50">
                  Failed to load admissions. Please refresh or try again.
                </TableCell>
              </TableRow>
            ) : admissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-14 text-slate-500 bg-slate-50/20">
                  <div className="flex flex-col items-center gap-3">
                    <Hospital className="h-10 w-10 text-slate-300" />
                    <div>
                      <p className="font-semibold text-base text-slate-700">No Admissions Found</p>
                      <p className="text-xs text-slate-400 mt-0.5">There are no active or historical hospitalizations recorded.</p>
                    </div>
                    <Link href="/admin/admissions/new" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> First Admission
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              admissions.map((admission) => (
                <TableRow key={admission.id} className="hover:bg-slate-50/40 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{admission.patientName}</span>
                      <span className="text-xs font-medium text-slate-400 font-mono">ID: #{admission.patientId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {admission.doctorName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{admission.wardName}</span>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Ward ID: #{admission.wardId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-semibold text-xs border px-2.5 py-0.5",
                        admission.admissionType === "URGENT" 
                          ? "bg-rose-50/75 text-rose-700 border-rose-100" 
                          : "bg-emerald-50/75 text-emerald-700 border-emerald-100"
                      )}
                    >
                      {admission.admissionType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {new Date(admission.admissionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "font-medium shadow-2xs border-0",
                        admission.status === "ACTIVE" 
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                          : "bg-slate-300 text-slate-700"
                      )}
                    >
                      {admission.status === "ACTIVE" ? (
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3 animate-pulse shrink-0" />
                          Active
                        </span>
                      ) : (
                        "Discharged"
                      )}
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
                      <DropdownMenuContent align="end" className="border-slate-200 shadow-md">
                        <DropdownMenuItem>
                          <Link href={`/admin/admissions/${admission.id}`} className="flex items-center w-full">
                            <Eye className="mr-2 h-4 w-4" /> View details
                          </Link>
                        </DropdownMenuItem>
                        {admission.status === "ACTIVE" && (
                          <DropdownMenuItem>
                            <Link href={`/admin/admissions/${admission.id}`} className="flex items-center w-full text-amber-600">
                              <LogOut className="mr-2 h-4 w-4" /> Discharge Patient
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/20">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 0) setPage(page - 1);
                    }}
                    className={page === 0 ? "pointer-events-none opacity-50 font-medium" : "font-medium"}
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
                      className="font-medium"
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
                    className={page === totalPages - 1 ? "pointer-events-none opacity-50 font-medium" : "font-medium"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
