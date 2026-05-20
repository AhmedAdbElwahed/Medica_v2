"use client";

import { useSession, signOut } from "next-auth/react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { data: session } = useSession();
  const user = session?.user;

  // Split name back to first and last if needed, or just use it
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("") : "U";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <div className="flex w-96 items-center relative">
        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search patients, doctors..." 
          className="pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-slate-200"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-slate-500">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-white" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger 
            className={cn(
              buttonVariants({ variant: "ghost" }), 
              "flex items-center gap-3 px-2 h-auto"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{user?.role?.replace("ROLE_", "")}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Separator({ orientation = "horizontal", className }: { orientation?: "horizontal" | "vertical", className?: string }) {
  return (
    <div 
      className={cn(
        "bg-slate-200", 
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )} 
    />
  );
}
