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
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";

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
      "relative flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4">
        {isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="mx-auto text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent h-10 w-10 p-0 flex items-center justify-center rounded-lg"
            title="Expand Sidebar"
          >
            <Image
              src="/hms_logo.png"
              alt="Medica logo"
              width={40}
              height={40}
              className="object-contain brightness-0 invert"
              priority
            />
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 pl-2">
              <Image
                src="/hms_logo.png"
                alt="Medica logo"
                width={32}
                height={32}
                className="object-contain brightness-0 invert"
                priority
              />
              <span className="text-xl font-bold tracking-tight text-white">
                Medica
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

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
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
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

      <Separator className="bg-sidebar-border" />

      <div className="p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
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
