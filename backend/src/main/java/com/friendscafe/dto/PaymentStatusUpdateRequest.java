package com.friendscafe.dto;

import com.friendscafe.entity.PaymentMethod;
import com.friendscafe.entity.PaymentStatus;
import lombok.Data;

@Data
public class PaymentStatusUpdateRequest {
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
}
