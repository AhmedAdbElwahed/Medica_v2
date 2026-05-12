package org.hms.medica.admission.repository;

import org.hms.medica.admission.model.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long>, QuerydslPredicateExecutor<Admission> {
    @Query("SELECT COUNT(a) FROM Admission a WHERE a.ward.id = :wardId AND a.actualDischargeDate IS NULL")
    long countActiveAdmissionsInWard(@Param("wardId") Long wardId);
}
