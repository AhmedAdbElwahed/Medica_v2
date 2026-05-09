package org.hms.medica.doctor.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.user.model.User;
import org.hms.medica.ward.model.Ward;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

@Entity
@Table(name = "doctors")
@PrimaryKeyJoinColumn(name = "user_id")
@Getter
@Setter
public class Doctor extends User {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Specialty specialty;

    private String education;
    private String certifications;

    @Column(nullable = false)
    private int yearsOfExperience;

    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Column(nullable = false)
    private LocalTime workStartTime;

    @Column(nullable = false)
    private LocalTime workEndTime;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "doctor_working_days", joinColumns = @JoinColumn(name = "doctor_id"))
    private Set<DayOfWeek> workingDays = Set.of(
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY, DayOfWeek.SUNDAY);

    private boolean activeStatus = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id")
    private Ward ward;
}
