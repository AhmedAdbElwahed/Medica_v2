"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard.api";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  CalendarCheck, 
  ClipboardList, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6", "#ec4899"];

export default function AdminDashboardPage() {
  // Parallel fetching
  const { data: summary, isLoading: isSummaryLoading } = useQuery({ 
    queryKey: ["dashboard", "summary"], 
    queryFn: dashboardApi.getSummary 
  });
  
  const { data: trends, isLoading: isTrendsLoading } = useQuery({ 
    queryKey: ["dashboard", "trends"], 
    queryFn: dashboardApi.getAdmissionTrends 
  });
  
  const { data: distribution, isLoading: isDistLoading } = useQuery({ 
    queryKey: ["dashboard", "distribution"], 
    queryFn: dashboardApi.getDepartmentDistribution 
  });
  
  const { data: activity, isLoading: isActivityLoading } = useQuery({ 
    queryKey: ["dashboard", "activity"], 
    queryFn: dashboardApi.getRecentActivity 
  });
  
  const { data: todayAppts, isLoading: isApptsLoading } = useQuery({ 
    queryKey: ["dashboard", "today-appointments"], 
    queryFn: dashboardApi.getTodayAppointments 
  });
  
  const { data: recentPatients, isLoading: isPatientsLoading } = useQuery({ 
    queryKey: ["dashboard", "recent-patients"], 
    queryFn: dashboardApi.getRecentPatients 
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Admin Dashboard" 
        description="Welcome back, here's what's happening today."
      />

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Patients" 
          value={summary?.data.totalPatients} 
          icon={Users} 
          loading={isSummaryLoading}
          trend="+12% from last month"
          trendType="up"
        />
        <KpiCard 
          title="Today's Appointments" 
          value={summary?.data.todayAppointments} 
          icon={CalendarCheck} 
          loading={isSummaryLoading}
          trend="+5 today"
          trendType="up"
        />
        <KpiCard 
          title="Active Admissions" 
          value={summary?.data.activeAdmissions} 
          icon={ClipboardList} 
          loading={isSummaryLoading}
          trend="-2 from yesterday"
          trendType="down"
        />
        <KpiCard 
          title="Ward Efficiency" 
          value={summary?.data.wardEfficiencyRate ? `${summary.data.wardEfficiencyRate}%` : undefined} 
          icon={TrendingUp} 
          loading={isSummaryLoading}
          trend="+2.1% improvement"
          trendType="up"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Admission Trends */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Admission Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isTrendsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends?.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0ea5e9" 
                    strokeWidth={2} 
                    dot={{ fill: "#0ea5e9", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isDistLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution?.data ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="patientCount"
                    nameKey="wardName"
                  >
                    {(distribution?.data ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isActivityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {(activity?.data ?? []).slice(0, 5).map((act, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <StatusBadge status={act.type} className="mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{act.description}</p>
                      <p className="text-xs text-slate-500">{format(new Date(act.timestamp), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                ))}
                {(!activity?.data || activity.data.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Today&apos;s Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {isApptsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {(todayAppts?.data ?? []).slice(0, 5).map((appt) => (
                  <div key={appt.id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-100 text-slate-600">
                        {appt.patientName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{appt.patientName}</p>
                      <p className="text-xs text-slate-500">with Dr. {appt.doctorName} • {format(new Date(appt.startTime), "h:mm a")}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
                {(!todayAppts?.data || todayAppts.data.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">No appointments today.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {isPatientsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {(recentPatients?.data ?? []).slice(0, 5).map((patient) => (
                  <div key={patient.id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-100 text-slate-600">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{patient.firstName} {patient.lastName}</p>
                      <p className="text-xs text-slate-500">Registered {format(new Date(), "MMM d, yyyy")}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
                {(!recentPatients?.data || recentPatients.data.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">No recent patients.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value?: string | number;
  icon: any;
  loading?: boolean;
  trend?: string;
  trendType?: "up" | "down";
}

function KpiCard({ title, value, icon: Icon, loading, trend, trendType }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value ?? "0"}</div>
        )}
        {trend && (
          <p className="mt-1 flex items-center text-xs">
            {trendType === "up" ? (
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={trendType === "up" ? "text-green-500" : "text-red-500"}>{trend}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
