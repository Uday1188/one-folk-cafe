package com.friendscafe.dto;

import com.friendscafe.entity.PaymentMethod;
import com.friendscafe.entity.PaymentStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    private String customerName;

    private String customerMobile;

    private String tableNumber;

    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;

    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
}
