package org.hms.medica.patient.repository;

import org.hms.medica.patient.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long>, QuerydslPredicateExecutor<Patient> {
    Optional<Patient> findByEmail(String email);
    boolean existsByEmail(String email);
}
