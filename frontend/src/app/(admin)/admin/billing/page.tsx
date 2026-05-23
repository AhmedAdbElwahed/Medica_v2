"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing.api";
import { BillResponse, BillStatus } from "@/types/billing.types";
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
  Search, 
  MoreVertical, 
  RotateCcw, 
  Loader2, 
  Calendar, 
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  CreditCard,
  Ban,
  ArrowUpRight
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

export default function BillingListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Refund dialog state
  const [refundBill, setRefundBill] = useState<BillResponse | null>(null);

  // Queries to load bills
  const { data: billsPage, isLoading, isError } = useQuery({
    queryKey: ["bills", { page, size }],
    queryFn: () => billingApi.getAllBills({ page, size }),
  });

  const refundMutation = useMutation({
    mutationFn: (id: number) => billingApi.refund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Payment refunded successfully!");
      setRefundBill(null);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to process refund";
      toast.error(msg);
    }
  });

  const rawBills = billsPage?.data.content ?? [];
  const totalPages = billsPage?.data.totalPages ?? 0;

  // Filter & search logic
  const filteredBills = rawBills.filter((bill) => {
    const matchesSearch = 
      bill.patientName.toLowerCase().includes(search.toLowerCase()) ||
      bill.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      bill.kbInvoiceId.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = 
      statusFilter === "ALL" || 
      bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefundSubmit = () => {
    if (refundBill) {
      refundMutation.mutate(refundBill.id);
    }
  };

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return { date: "N/A", time: "" };
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

  const renderStatusBadge = (status: BillStatus) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 px-2.5 py-0.5 border-none font-medium">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1 px-2.5 py-0.5 font-medium">
            <AlertCircle className="h-3 w-3 text-amber-600" /> Pending
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 gap-1 px-2.5 py-0.5 font-medium">
            <RotateCcw className="h-3 w-3 text-indigo-600" /> Refunded
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 gap-1 px-2.5 py-0.5 font-medium">
            <Ban className="h-3 w-3 text-rose-600" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 px-2.5 py-0.5 font-medium">
            <HelpCircle className="h-3 w-3" /> {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Payments"
        description="Monitor patient checkout logs, invoice settlement states, and issue refunds via Kill Bill."
      />

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-100">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Transactions</span>
            <h4 className="text-xl font-bold text-slate-800 mt-0.5">{billsPage?.data.totalElements ?? 0}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid Invoices</span>
            <h4 className="text-xl font-bold text-slate-800 mt-0.5">
              {rawBills.filter(b => b.status === "PAID").length} <span className="text-xs text-slate-400 font-normal">on page</span>
            </h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Settlement</span>
            <h4 className="text-xl font-bold text-slate-800 mt-0.5">
              {rawBills.filter(b => b.status === "PENDING").length} <span className="text-xs text-slate-400 font-normal">on page</span>
            </h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Refunded</span>
            <h4 className="text-xl font-bold text-slate-800 mt-0.5">
              {rawBills.filter(b => b.status === "REFUNDED").length} <span className="text-xs text-slate-400 font-normal">on page</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Status Quick Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b pb-3">
          {["ALL", "PAID", "PENDING", "REFUNDED", "FAILED"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "h-8 rounded-lg text-xs font-bold transition-all px-3",
                statusFilter === status 
                  ? "" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {status === "ALL" ? "All Bills" : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {/* Text Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by Patient, Doctor, or Kill Bill Invoice ID..." 
            className="pl-10 h-10 border-slate-200 shadow-none focus-visible:ring-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid/Table Data Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Invoice ID</TableHead>
              <TableHead className="font-semibold text-slate-600">Patient</TableHead>
              <TableHead className="font-semibold text-slate-600">Attending Doctor</TableHead>
              <TableHead className="font-semibold text-slate-600">Appointment Date</TableHead>
              <TableHead className="font-semibold text-slate-600">Settled Amount</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="font-semibold text-slate-600">Date Settled</TableHead>
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
                  An error occurred while loading billing logs. Please refresh the page.
                </TableCell>
              </TableRow>
            ) : filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileText className="h-10 w-10 text-slate-300" />
                    <span className="font-medium">No transaction receipts found.</span>
                    <p className="text-xs max-w-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => {
                const apptDate = formatDateTime(bill.appointmentTime);
                const paidDate = formatDateTime(bill.paidAt);
                return (
                  <TableRow key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-slate-500">
                      <span className="text-slate-400 mr-0.5">#</span>{bill.id}
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]" title={bill.kbInvoiceId}>
                        KB: {bill.kbInvoiceId.substring(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-slate-800">{bill.patientName}</TableCell>
                    <TableCell className="font-medium text-slate-700">Dr. {bill.doctorName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" /> {apptDate.date}
                        </span>
                        <span className="text-xs text-slate-400 font-mono mt-0.5">{apptDate.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-slate-900 flex items-center">
                        {(bill.amount / 100).toFixed(2)} EGP
                      </span>
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(bill.status)}
                    </TableCell>
                    <TableCell>
                      {bill.paidAt ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{paidDate.date}</span>
                          <span className="text-xs text-slate-400 font-mono mt-0.5">{paidDate.time}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {bill.status === "PAID" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon" }),
                              "h-8 w-8 hover:bg-slate-100 cursor-pointer"
                            )}
                          >
                            <MoreVertical className="h-4 w-4 text-slate-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              className="text-rose-600 focus:text-rose-600 cursor-pointer font-semibold"
                              onClick={() => setRefundBill(bill)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" /> Issue Refund
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 select-none mr-2 block">Settled</span>
                      )}
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

      {/* Refund Confirmation Dialog */}
      <Dialog open={!!refundBill} onOpenChange={(open) => !open && setRefundBill(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <RotateCcw className="h-5 w-5 animate-pulse text-rose-500" />
              Confirm Transaction Refund
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to refund invoice **#{refundBill?.id}**?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 text-xs text-rose-800 space-y-2">
              <p className="font-bold flex items-center gap-1">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> Billing Engine Impact Summary:
              </p>
              <ul className="list-disc pl-4 space-y-1 mt-1 font-medium">
                <li>Issues a mock refund transaction in **Kill Bill** billing database.</li>
                <li>Changes the local bill status to `REFUNDED`.</li>
                <li>Marks the corresponding appointment as **Unpaid** (paid=false).</li>
              </ul>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs border">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-800">{refundBill?.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-mono font-bold text-slate-900">
                  {refundBill ? (refundBill.amount / 100).toFixed(2) : "0.00"} EGP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kill Bill key:</span>
                <span className="font-mono text-slate-600">{refundBill?.kbInvoiceId.substring(0, 16)}...</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRefundBill(null)} disabled={refundMutation.isPending}>
              Cancel
            </Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold" 
              onClick={handleRefundSubmit}
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
