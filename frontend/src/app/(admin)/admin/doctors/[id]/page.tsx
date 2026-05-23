"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { doctorApi } from "@/lib/api/doctor.api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Pencil, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  MapPin,
  Calendar,
  ShieldCheck
} from "lucide-react";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DoctorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const doctorId = parseInt(id as string);

  const { data: doctor, isLoading, isError } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => doctorApi.getById(doctorId),
    select: (res) => res.data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] col-span-1" />
          <Skeleton className="h-[400px] col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Doctor not found</h2>
        <p className="text-slate-500 mt-2">The doctor you are looking for does not exist or has been removed.</p>
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={() => router.push("/admin/doctors")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctors
        </Button>
      </div>
    );
  }

  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-slate-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Link href={`/admin/doctors/${doctor.id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 border-2 border-slate-100">
                <AvatarImage src={doctor.profilePhotoUrl} className="object-cover" />
                <AvatarFallback className="bg-blue-50 text-blue-600 text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-slate-900">Dr. {doctor.firstName} {doctor.lastName}</h2>
              <p className="text-blue-600 font-medium">{doctor.specialty.replace("_", " ")}</p>
              
              <div className="flex gap-2 mt-4">
                <Badge className={doctor.activeStatus ? "bg-green-500" : "bg-slate-300"}>
                  {doctor.activeStatus ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">ID: {doctor.id}</Badge>
              </div>

              <Separator className="my-6" />

              <div className="w-full space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium">{doctor.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">License Number</p>
                    <p className="text-sm font-medium font-mono">{doctor.licenseNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Experience</p>
                    <p className="text-sm font-medium">{doctor.yearsOfExperience} years</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Joined Date</p>
                    <p className="text-sm font-medium">{new Date(doctor.registrationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Professional Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Education</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {doctor.education}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Certifications</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {doctor.certifications}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Work Schedule & Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Working Hours</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {doctor.workStartTime} - {doctor.workEndTime}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Available for appointments during these hours.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Assigned Ward</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <p className="text-lg font-semibold text-slate-900">
                      Ward #{doctor.wardId}
                    </p>
                  </div>
                  <Link href={`/admin/wards/${doctor.wardId}`} className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                    View Ward Details
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
