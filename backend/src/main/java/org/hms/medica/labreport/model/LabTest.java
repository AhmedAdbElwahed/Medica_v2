package org.hms.medica.labreport.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.common.entity.BaseEntity;

@Entity
@Table(name = "lab_tests")
@Getter
@Setter
public class LabTest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lab_report_id")
    private LabReport labReport;

    @Column(nullable = false)
    private String testName;

    @Column(nullable = false)
    private Double actualValue;

    @Column(nullable = false)
    private Double normalRangeMin;

    @Column(nullable = false)
    private Double normalRangeMax;

    private String unit;
}
