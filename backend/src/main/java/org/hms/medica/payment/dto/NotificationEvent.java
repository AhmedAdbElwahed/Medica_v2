package org.hms.medica.payment.dto;

import lombok.Data;

@Data
public class NotificationEvent {
    private String eventType;
    private String objectId;
}
