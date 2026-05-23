"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "@/lib/api/appointments.api";
import { doctorApi } from "@/lib/api/doctor.api";
import { AppointmentFilters, AppointmentResponse, AppointmentStatus } from "@/types/appointment.types";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
  Trash2, 
  FilterX, 
  Loader2, 
  Calendar, 
  Video, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
  DollarSign
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AppointmentsListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Filters State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaid, setSelectedPaid] = useState<string>("all");
  const [selectedVirtual, setSelectedVirtual] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Dialog States
  const [statusDialogAppt, setStatusDialogAppt] = useState<AppointmentResponse | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<number | null>(null);

  // Load doctors for filtering dropdown
  const { data: doctorsPage } = useQuery({
    queryKey: ["doctors", { size: 100 }],
    queryFn: () => doctorApi.getAll({ size: 100 }),
  });
  const doctorsList = doctorsPage?.data.content ?? [];

  // Build filters object
  const filters: AppointmentFilters = {
    page,
    size,
    doctorId: selectedDoctorId !== "all" ? Number(selectedDoctorId) : undefined,
    status: selectedStatus !== "all" ? (selectedStatus as AppointmentStatus) : undefined,
    paid: selectedPaid !== "all" ? selectedPaid === "true" : undefined,
    virtual: selectedVirtual !== "all" ? selectedVirtual === "true" : undefined,
    date: selectedDate || undefined,
  };

  // Main list query
  const { data: appointmentsPage, isLoading, isError } = useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => appointmentsApi.getAll(filters),
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) => 
      appointmentsApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment status updated successfully");
      setStatusDialogAppt(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update status";
      toast.error(msg);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => appointmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment deleted successfully");
      setDeleteDialogId(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete appointment";
      toast.error(msg);
    }
  });

  const appointments = appointmentsPage?.data.content ?? [];
  const totalPages = appointmentsPage?.data.totalPages ?? 0;

  const handleClearFilters = () => {
    setSelectedDoctorId("all");
    setSelectedStatus("all");
    setSelectedPaid("all");
    setSelectedVirtual("all");
    setSelectedDate("");
    setPage(0);
    toast.success("Filters cleared");
  };

  const handleStatusChange = (status: AppointmentStatus) => {
    if (statusDialogAppt) {
      statusMutation.mutate({ id: statusDialogAppt.id, status });
    }
  };

  const handleDelete = () => {
    if (deleteDialogId) {
      deleteMutation.mutate(deleteDialogId);
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return { date: formattedDate, time: formattedTime };
    } catch {
      return { date: isoString, time: "" };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="View and manage patient scheduling, visit settings, and payment states."
        actions={
          <Link
            href="/admin/appointments/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Book Appointment
          </Link>
        }
      />

      {/* Filter and Query Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Doctor Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Doctor</span>
            <Select value={selectedDoctorId} onValueChange={(val) => { setSelectedDoctorId(val || "all"); setPage(0); }}>
              <SelectTrigger className="w-full h-10 border-slate-200 hover:border-slate-300">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctorsList.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    Dr. {d.firstName} {d.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Date</span>
            <div className="relative">
              <Input
                type="date"
                className="h-10 border-slate-200"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setPage(0); }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Status</span>
            <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val || "all"); setPage(0); }}>
              <SelectTrigger className="w-full h-10 border-slate-200 hover:border-slate-300">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELED">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Paid / Unpaid Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Billing Status</span>
            <Select value={selectedPaid} onValueChange={(val) => { setSelectedPaid(val || "all"); setPage(0); }}>
              <SelectTrigger className="w-full h-10 border-slate-200 hover:border-slate-300">
                <SelectValue placeholder="All Billing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Billing</SelectItem>
                <SelectItem value="true">Paid</SelectItem>
                <SelectItem value="false">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Virtual / Physical Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Visit Channel</span>
            <Select value={selectedVirtual} onValueChange={(val) => { setSelectedVirtual(val || "all"); setPage(0); }}>
              <SelectTrigger className="w-full h-10 border-slate-200 hover:border-slate-300">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="true">Virtual (Online)</SelectItem>
                <SelectItem value="false">In-Person (Clinic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Helper Row */}
        {(selectedDoctorId !== "all" || selectedStatus !== "all" || selectedPaid !== "all" || selectedVirtual !== "all" || selectedDate) && (
          <div className="flex items-center justify-between border-t pt-3">
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-slate-500 hover:text-slate-900 h-8 px-2">
              <FilterX className="mr-1.5 h-3.5 w-3.5" /> Clear all filters
            </Button>
            <span className="text-xs text-slate-400">Showing filtered results</span>
          </div>
        )}
      </div>

      {/* Main Grid/Table Data Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Patient</TableHead>
              <TableHead className="font-semibold text-slate-600">Attending Doctor</TableHead>
              <TableHead className="font-semibold text-slate-600">Date & Time</TableHead>
              <TableHead className="font-semibold text-slate-600">Reason</TableHead>
              <TableHead className="font-semibold text-slate-600">Channel</TableHead>
              <TableHead className="font-semibold text-slate-600">Paid</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {Array.from({ length: 8 }).map((_, tdIdx) => (
                    <TableCell key={tdIdx}><Skeleton className="h-6 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-rose-600 font-medium">
                  An error occurred while loading appointments. Please refresh the page.
                </TableCell>
              </TableRow>
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Calendar className="h-10 w-10 text-slate-300" />
                    <span className="font-medium">No appointments found.</span>
                    <p className="text-xs max-w-xs text-slate-400">Try adjusting your filters or book a new appointment.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appt) => {
                const { date, time } = formatDateTime(appt.startTime);
                return (
                  <TableRow key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{appt.patientName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">Dr. {appt.doctorName}</span>
                        <span className="text-xs text-slate-500 capitalize">{appt.doctorSpecialty.toLowerCase().replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" /> {date}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-600" title={appt.reasonForVisit}>
                      {appt.reasonForVisit}
                    </TableCell>
                    <TableCell>
                      {appt.virtual ? (
                        <Badge variant="outline" className="bg-sky-50 text-sky-700 hover:bg-sky-50 border-sky-200 gap-1 px-2 py-0.5">
                          <Video className="h-3.5 w-3.5" /> Virtual
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 hover:bg-slate-50 border-slate-200 gap-1 px-2 py-0.5">
                          In-Person
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        {appt.paid ? (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-2 py-0.5">
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 font-medium px-2 py-0.5">
                            Unpaid
                          </Badge>
                        )}
                        <span className="text-xs font-mono font-medium text-slate-500 flex items-center">
                          {(appt.feeAmount / 100).toFixed(2)} EGP
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={appt.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "h-8 w-8 hover:bg-slate-100 cursor-pointer"
                          )}
                        >
                        <MoreVertical className="h-4 w-4 text-slate-500" />
                      </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => setStatusDialogAppt(appt)}
                          >
                            <Activity className="mr-2 h-4 w-4 text-slate-500" /> Update Status
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="text-rose-600 focus:text-rose-600 cursor-pointer"
                            onClick={() => setDeleteDialogId(appt.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Appointment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Paginated Row Counter Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <Pagination className="w-auto m-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 0) setPage(page - 1);
                    }}
                    className={page === 0 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
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
                    className={page === totalPages - 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Update Status Dialog */}
      <Dialog open={!!statusDialogAppt} onOpenChange={(open) => !open && setStatusDialogAppt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              Modify the scheduling status for <span className="font-semibold text-slate-900">{statusDialogAppt?.patientName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-150">
              <span className="text-sm font-semibold text-slate-500">Current Status:</span>
              {statusDialogAppt && <StatusBadge status={statusDialogAppt.status} />}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="h-14 flex flex-col gap-1 border-slate-200 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700"
                onClick={() => handleStatusChange("PENDING")}
                disabled={statusMutation.isPending}
              >
                <span className="text-xs font-bold uppercase">Pending</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-14 flex flex-col gap-1 border-slate-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                onClick={() => handleStatusChange("COMPLETED")}
                disabled={statusMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs font-bold uppercase">Complete</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-14 flex flex-col gap-1 border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700"
                onClick={() => handleStatusChange("CANCELED")}
                disabled={statusMutation.isPending}
              >
                <XCircle className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-bold uppercase">Cancel</span>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStatusDialogAppt(null)} disabled={statusMutation.isPending}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be reversed. This will permanently delete the scheduling logs from the hospital management records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogId(null)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
