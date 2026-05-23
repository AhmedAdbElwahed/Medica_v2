"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema, AppointmentValues } from "@/lib/validators/appointment.schema";
import { appointmentsApi } from "@/lib/api/appointments.api";
import { patientApi } from "@/lib/api/patient.api";
import { doctorApi } from "@/lib/api/doctor.api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Video, 
  DollarSign, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BookAppointmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  // Queries to load patients and doctors
  const { data: patientsPage, isLoading: isPatientsLoading } = useQuery({
    queryKey: ["patients", { size: 100 }],
    queryFn: () => patientApi.getAll({ size: 100 }),
  });

  const { data: doctorsPage, isLoading: isDoctorsLoading } = useQuery({
    queryKey: ["doctors", { size: 100 }],
    queryFn: () => doctorApi.getAll({ size: 100 }),
  });

  const patients = patientsPage?.data.content ?? [];
  const doctors = doctorsPage?.data.content ?? [];

  const form = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema) as any,
    defaultValues: {
      patientId: undefined,
      doctorId: undefined,
      date: new Date().toISOString().split("T")[0],
      time: "",
      reasonForVisit: "",
      virtual: false,
      feeAmount: 150, // default fee in EGP
    },
  });

  const doctorIdValue = form.watch("doctorId");
  const dateValue = form.watch("date");
  const timeValue = form.watch("time");
  const patientIdValue = form.watch("patientId");

  // Reset time slot if doctor or date changes
  useEffect(() => {
    form.setValue("time", "");
  }, [doctorIdValue, dateValue, form]);

  // Load available time slots when both doctor and date are chosen
  const { 
    data: availableSlots = [], 
    isLoading: isSlotsLoading,
    isError: isSlotsError,
    refetch: refetchSlots
  } = useQuery({
    queryKey: ["doctor-slots", doctorIdValue, dateValue],
    queryFn: () => doctorApi.getAvailableSlots(Number(doctorIdValue), dateValue).then((res) => res.data),
    enabled: !!doctorIdValue && !!dateValue,
  });

  const mutation = useMutation({
    mutationFn: (data: AppointmentValues) => {
      // Map form values to AdminBookAppointmentRequest (Fee amount converted to piasters, 1 EGP = 100 piasters)
      const requestData = {
        patientId: Number(data.patientId),
        doctorId: Number(data.doctorId),
        startTime: `${data.date}T${data.time}:00`, // LocalDateTime format
        reasonForVisit: data.reasonForVisit,
        virtual: data.virtual,
        feeAmount: Math.round(Number(data.feeAmount) * 100),
      };
      return appointmentsApi.bookOnBehalf(requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment booked successfully!");
      router.push("/admin/appointments");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to book appointment";
      toast.error(message);
    }
  });

  const onSubmit = async (values: AppointmentValues) => {
    await mutation.mutateAsync(values);
  };

  // Step Navigation Guards
  const handleNextStep = async () => {
    if (step === 1) {
      const isPatientValid = await form.trigger("patientId");
      if (isPatientValid) setStep(2);
    } else if (step === 2) {
      const isDoctorDateValid = await form.trigger(["doctorId", "date", "time"]);
      if (isDoctorDateValid) {
        if (!timeValue) {
          toast.error("Please select an available time slot");
          return;
        }
        setStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectedPatient = patients.find(p => p.id === Number(patientIdValue));
  const selectedDoctor = doctors.find(d => d.id === Number(doctorIdValue));

  const isLoadingChoices = isPatientsLoading || isDoctorsLoading;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader 
        title="Book Appointment" 
        description="Book an appointment on behalf of a patient using our interactive scheduling engine."
      />

      {/* Premium Wizard Progress Stepper */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
            step === 1 ? "bg-primary text-white scale-110 shadow-sm" : step > 1 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"
          )}>
            {step > 1 ? <CheckCircle className="h-5 w-5" /> : "1"}
          </div>
          <span className={cn("text-xs font-semibold", step === 1 ? "text-slate-900" : "text-slate-400")}>Select Patient</span>
        </div>
        <div className="h-0.5 flex-1 bg-slate-100 mx-4" />
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
            step === 2 ? "bg-primary text-white scale-110 shadow-sm" : step > 2 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"
          )}>
            {step > 2 ? <CheckCircle className="h-5 w-5" /> : "2"}
          </div>
          <span className={cn("text-xs font-semibold", step === 2 ? "text-slate-900" : "text-slate-400")}>Doctor & Slots</span>
        </div>
        <div className="h-0.5 flex-1 bg-slate-100 mx-4" />
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
            step === 3 ? "bg-primary text-white scale-110 shadow-sm" : "bg-slate-100 text-slate-400"
          )}>
            "3"
          </div>
          <span className={cn("text-xs font-semibold", step === 3 ? "text-slate-900" : "text-slate-400")}>Details & Confirm</span>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="pt-6">
          {isLoadingChoices ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              <p className="text-slate-500 font-medium text-sm">Loading scheduling data...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                
                {/* STEP 1: SELECT PATIENT */}
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 items-center">
                      <User className="h-5 w-5 text-slate-500" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">Identify the Patient</h4>
                        <p className="text-xs text-slate-500">Search and select the patient account requesting the appointment.</p>
                      </div>
                    </div>
                    <FormField
                      control={form.control as any}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-slate-700">Patient Account</FormLabel>
                          <Select 
                            onValueChange={(val) => val && field.onChange(Number(val))} 
                            value={field.value ? String(field.value) : ""}
                            items={patients.map((p) => ({
                              value: String(p.id),
                              label: `${p.firstName} ${p.lastName} (ID: #${p.id})`,
                            }))}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-11">
                                <SelectValue placeholder="Search patient name..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {patients.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.firstName} {p.lastName} (ID: #{p.id} • {p.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* STEP 2: SELECT DOCTOR & TIME SLOT */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Doctor Choice */}
                      <FormField
                        control={form.control as any}
                        name="doctorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-slate-700">Select Attending Doctor</FormLabel>
                            <Select 
                              onValueChange={(val) => val && field.onChange(Number(val))} 
                              value={field.value ? String(field.value) : ""}
                              items={doctors.map((d) => ({
                                value: String(d.id),
                                label: `Dr. ${d.firstName} ${d.lastName} (${d.specialty})`,
                              }))}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full h-11">
                                  <SelectValue placeholder="Select doctor..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {doctors.map((d) => (
                                  <SelectItem key={d.id} value={String(d.id)}>
                                    Dr. {d.firstName} {d.lastName} ({d.specialty.replace("_", " ")})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Select Date */}
                      <FormField
                        control={form.control as any}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-slate-700">Preferred Date</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type="date" className="h-11" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Time Slot Selector Grid Section */}
                    {doctorIdValue && dateValue ? (
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>Available Time Slots</span>
                        </div>
                        {isSlotsLoading ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500 py-4 justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> Fetching slots from scheduling matrix...
                          </div>
                        ) : isSlotsError ? (
                          <div className="text-rose-600 text-xs py-2 text-center font-medium bg-rose-50 rounded-lg border border-rose-100">
                            Failed to fetch slots. Doctor may not be active or works on other days.
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div className="p-6 text-center bg-slate-50 rounded-xl border flex flex-col items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0" />
                            <span className="font-medium text-slate-700 text-sm">No Time Slots Available</span>
                            <p className="text-xs text-slate-400 max-w-md">
                              This doctor is either fully booked, has past slots for today, or does not have working hours configured on this weekday.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {availableSlots.map((slotString) => {
                              // Slot comes as LocalTime string "09:30:00" or "09:30"
                              const shortTime = slotString.substring(0, 5);
                              const isSelected = timeValue === shortTime;
                              return (
                                <Button
                                  key={slotString}
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "h-10 transition-all font-mono font-medium text-xs",
                                    isSelected 
                                      ? "bg-primary text-white border-primary hover:bg-primary/95 hover:text-white" 
                                      : "hover:bg-slate-50 hover:text-slate-800"
                                  )}
                                  onClick={() => form.setValue("time", shortTime, { shouldValidate: true })}
                                >
                                  {shortTime}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                        <FormField
                          control={form.control as any}
                          name="time"
                          render={() => (
                            <FormItem>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2">
                        <Calendar className="h-8 w-8 text-slate-300" />
                        <span className="text-sm font-medium">Select a Doctor and Date first</span>
                        <p className="text-xs text-slate-400">Available working hours will appear automatically once selected.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: DETAILS & CONFIRMATION */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Reason for Visit */}
                      <FormField
                        control={form.control as any}
                        name="reasonForVisit"
                        render={({ field }) => (
                          <FormItem className="col-span-1 md:col-span-2">
                            <FormLabel className="font-semibold text-slate-700">Reason for Visit</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe patient symptoms or consultation purpose..." 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Booking Fee Amount */}
                      <FormField
                        control={form.control as any}
                        name="feeAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-slate-700">Consultation Fee (EGP)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input type="number" step="0.5" className="pl-10 h-11" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>Define the service fee amount in EGP.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Virtual Toggle Channel */}
                      <FormField
                        control={form.control as any}
                        name="virtual"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-slate-50/50">
                            <div className="space-y-0.5">
                              <FormLabel className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <Video className="h-4 w-4 text-slate-500" /> Virtual Telehealth
                              </FormLabel>
                              <FormDescription>
                                Enable virtual video call consultation.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Booking Confirmation Summary Panel */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b pb-2">
                        <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" /> Appointment Summary Check
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Patient:</span>
                          <span className="font-semibold text-slate-700">
                            {selectedPatient?.firstName} {selectedPatient?.lastName} (ID: #{selectedPatient?.id})
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Attending Doctor:</span>
                          <span className="font-semibold text-slate-700">
                            Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Specialty:</span>
                          <span className="font-semibold text-slate-700 capitalize">
                            {selectedDoctor?.specialty.toLowerCase().replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Date & Slot Time:</span>
                          <span className="font-mono font-semibold text-slate-700">
                            {dateValue} @ {timeValue}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 sm:col-span-2">
                          <span className="text-slate-400">Channel Mode:</span>
                          <span className="font-semibold text-slate-700">
                            {form.watch("virtual") ? "Telehealth (Online Video Call)" : "Clinic Consultation (In-Person Visit)"}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 sm:col-span-2 items-center pt-2">
                          <span className="text-sm font-bold text-slate-600">Total Consultation Fee:</span>
                          <span className="text-sm font-bold text-slate-900 font-mono">
                            {Number(form.watch("feeAmount")).toFixed(2)} EGP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls / Navigation buttons */}
                <div className="flex justify-between gap-4 border-t pt-6">
                  {step > 1 ? (
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={handlePrevStep}
                      disabled={mutation.isPending}
                    >
                      <ChevronLeft className="mr-1.5 h-4 w-4" /> Back
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => router.push("/admin/appointments")}
                      disabled={mutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}

                  {step < 3 ? (
                    <Button 
                      type="button" 
                      onClick={handleNextStep}
                    >
                      Next Step <ChevronRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={mutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Booking
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
