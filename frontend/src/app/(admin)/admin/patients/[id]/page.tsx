"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { patientApi } from "@/lib/api/patient.api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Pencil, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Heart,
  ShieldCheck,
  UserRound,
  FileText
} from "lucide-react";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formatBloodType = (type: string) => {
  const map: Record<string, string> = {
    A_POS: "A+",
    A_NEG: "A-",
    B_POS: "B+",
    B_NEG: "B-",
    AB_POS: "AB+",
    AB_NEG: "AB-",
    O_POS: "O+",
    O_NEG: "O-",
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };
  return map[type] || type;
};

export default function PatientProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const patientId = parseInt(id as string);

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientApi.getById(patientId),
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

  if (isError || !patient) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Patient not found</h2>
        <p className="text-slate-500 mt-2">The patient you are looking for does not exist or has been removed.</p>
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={() => router.push("/admin/patients")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
        </Button>
      </div>
    );
  }

  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-slate-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Link href={`/admin/patients/${patient.id}/edit`}>
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
                <AvatarImage src={patient.profilePhotoUrl} className="object-cover" />
                <AvatarFallback className="bg-red-50 text-red-600 text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-slate-900">{patient.firstName} {patient.lastName}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-slate-500 font-medium text-sm">
                <Badge variant="secondary" className="capitalize text-xs">
                  {patient.gender.toLowerCase()}
                </Badge>
                <span>•</span>
                <span>{formatBloodType(patient.bloodType)} Blood Type</span>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Badge className="bg-green-500">Active</Badge>
                <Badge variant="outline">ID: {patient.id}</Badge>
              </div>

              <Separator className="my-6" />

              <div className="w-full space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium">{patient.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium">{patient.phone || "N/A"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Address</p>
                    <p className="text-sm font-medium">{patient.address || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Registration Date</p>
                    <p className="text-sm font-medium">
                      {patient.registrationDate ? new Date(patient.registrationDate).toLocaleDateString() : "N/A"}
                    </p>
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
                <UserRound className="h-5 w-5 text-red-500" />
                Medical & Demographic Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="text-base font-semibold text-slate-900">
                    {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Age: {patient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / 3.15576e+10) : "N/A"} years old
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Nationality</p>
                  <p className="text-base font-semibold text-slate-900">{patient.nationality || "N/A"}</p>
                  <p className="text-xs text-slate-500 mt-1">Primary nationality registered in record.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Marital Status</p>
                  <p className="text-base font-semibold text-slate-900 capitalize">{patient.maritalStatus.toLowerCase() || "N/A"}</p>
                  <p className="text-xs text-slate-500 mt-1">Registered social/marital status.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Insurance details</p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <p className="text-base font-semibold text-slate-900 font-mono">
                      {patient.insurancePolicyNumber || "No Insurance / Private"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Insurance policy number for billings.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-500" />
                Clinical Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-slate-500 border border-dashed rounded-lg">
                <p>No active clinical diagnoses, prescriptions, or allergies registered in this block.</p>
                <Link href="#" className="text-xs text-red-600 hover:underline mt-2 inline-block font-medium">
                  Add Clinical Summary
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
