package com.friendscafe.dto;

import com.friendscafe.entity.OrderStatus;
import com.friendscafe.entity.PaymentMethod;
import com.friendscafe.entity.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private CustomerDto customer;
    private String tableNumber;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private List<OrderItemDto> items;
    private LocalDateTime createdAt;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private LocalDateTime paidAt;
}
