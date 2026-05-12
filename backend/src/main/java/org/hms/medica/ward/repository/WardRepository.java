package org.hms.medica.ward.repository;

import org.hms.medica.ward.model.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface WardRepository extends JpaRepository<Ward, Long>, QuerydslPredicateExecutor<Ward> {
}
