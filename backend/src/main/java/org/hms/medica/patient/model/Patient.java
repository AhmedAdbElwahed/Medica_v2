package org.hms.medica.patient.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.admission.model.Admission;
import org.hms.medica.appointment.model.Appointment;
import org.hms.medica.diagnosis.model.Diagnosis;
import org.hms.medica.examination.model.Examination;
import org.hms.medica.history.model.PatientHistory;
import org.hms.medica.medication.model.Medication;
import org.hms.medica.user.model.User;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "patients")
@PrimaryKeyJoinColumn(name = "user_id")
@Getter
@Setter
public class Patient extends User {

    @Enumerated(EnumType.STRING)
    private BloodType bloodType;

    @Enumerated(EnumType.STRING)
    private MaritalStatus maritalStatus;

    private String insurancePolicyNumber;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, optional = true)
    private PatientHistory history;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Admission> admissions;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Diagnosis> diagnoses;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Examination> examinations;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "patient_medications",
        joinColumns = @JoinColumn(name = "patient_id"),
        inverseJoinColumns = @JoinColumn(name = "medication_id"))
    private Set<Medication> medications = new LinkedHashSet<>();
}
