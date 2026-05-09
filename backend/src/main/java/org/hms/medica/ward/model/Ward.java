package org.hms.medica.ward.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.common.entity.AuditedEntity;
import org.hms.medica.doctor.model.Doctor;

import java.util.List;

@Entity
@Table(name = "wards")
@Getter
@Setter
public class Ward extends AuditedEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String phoneNumber;
    private String email;

    @Column(nullable = false)
    private int numberOfBeds;

    private int numberOfNurses;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WardGender genderDesignation;

    private boolean active = true;
    private boolean locked = false;

    @OneToMany(mappedBy = "ward")
    private List<Doctor> doctors;
}
