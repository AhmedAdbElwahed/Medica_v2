"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { patientApi, PatientFilters } from "@/lib/api/patient.api";
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
  FilterX 
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
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PatientListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const filters: PatientFilters = {
    name: debouncedSearch || undefined,
    page,
    size
  };

  const { data: patientsPage, isLoading, isError } = useQuery({
    queryKey: ["patients", filters],
    queryFn: () => patientApi.getAll(filters),
  });

  const totalPages = patientsPage?.data.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Patients" 
        description="Manage your hospital's patients and their medical records."
        actions={
          <Link 
            href="/admin/patients/new" 
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> New Patient
          </Link>
        }
      />

      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {search && (
            <Button variant="ghost" onClick={() => setSearch("")} className="text-slate-500">
              <FilterX className="mr-2 h-4 w-4" /> Clear
            </Button>
          )}
          <Badge variant="outline" className="h-10 px-4 py-2 border-slate-200 text-slate-600 font-normal">
            Total: {patientsPage?.data.totalElements ?? 0}
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Blood Type</TableHead>
              <TableHead>Insurance #</TableHead>
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
                  Failed to load patients. Please try again.
                </TableCell>
              </TableRow>
            ) : patientsPage?.data.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No patients found.
                </TableCell>
              </TableRow>
            ) : (
              patientsPage?.data.content.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarImage src={patient.profilePhotoUrl} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-slate-600">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        <span className="text-xs text-slate-500">{patient.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {patient.gender.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {patient.bloodType.replace("_", "")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{patient.insurancePolicyNumber || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
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
                          <Link href={`/admin/patients/${patient.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/admin/patients/${patient.id}/edit`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Patient
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}
