"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Hotel, 
  ClipboardList, 
  CalendarCheck, 
  CreditCard, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/admin/patients", icon: Users },
  { label: "Doctors", href: "/admin/doctors", icon: UserRound },
  { label: "Wards", href: "/admin/wards", icon: Hotel },
  { label: "Admissions", href: "/admin/admissions", icon: ClipboardList },
  { label: "Appointments", href: "/admin/appointments", icon: CalendarCheck },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Profile", href: "/admin/profile", icon: UserRound },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className={cn(
      "relative flex flex-col border-r bg-slate-900 text-slate-100 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-6">
        {!isCollapsed && <span className="text-xl font-bold tracking-tight">Medica</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <Separator className="bg-slate-800" />

      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-slate-800" />

      <div className="p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-slate-400 hover:bg-slate-800 hover:text-white",
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
