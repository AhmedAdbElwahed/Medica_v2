package org.hms.medica.dashboard.dto;

import java.time.LocalDateTime;

public record RecentActivity(
    String type,
    String description,
    LocalDateTime timestamp
) {}
