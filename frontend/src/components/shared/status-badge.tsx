import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusType = "PENDING" | "COMPLETED" | "CANCELED" | "ADMISSION" | "DISCHARGE" | "REGISTRATION" | "APPOINTMENT";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "PENDING":
        return { label: "Pending", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200" };
      case "COMPLETED":
        return { label: "Completed", className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" };
      case "CANCELED":
        return { label: "Canceled", className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200" };
      case "ADMISSION":
        return { label: "Admission", className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" };
      case "DISCHARGE":
        return { label: "Discharge", className: "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200" };
      case "REGISTRATION":
        return { label: "Registration", className: "bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200" };
      case "APPOINTMENT":
        return { label: "Appointment", className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200" };
      default:
        return { label: status, className: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn("px-2 py-0.5 font-medium transition-colors", config.className, className)}>
      {config.label}
    </Badge>
  );
}
