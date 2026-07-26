package com.friendscafe.service;

import com.friendscafe.dto.OrderDto;
import com.friendscafe.dto.OrderRequest;
import com.friendscafe.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Map;

public interface OrderService {
    OrderDto createOrder(OrderRequest orderRequest);
    Page<OrderDto> getAllOrders(Pageable pageable);
    OrderDto getOrderById(Long id);
    OrderDto updateOrderStatus(Long id, OrderStatus status);
    OrderDto updateOrder(Long id, OrderRequest request);
    void deleteOrder(Long id);
    Page<OrderDto> filterByStatus(OrderStatus status, Pageable pageable);
    Page<OrderDto> filterByDate(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    Page<OrderDto> searchByCustomer(String customerNameOrMobile, Pageable pageable);
    Page<OrderDto> searchOrders(OrderStatus status, String tableNumber, String search, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    Map<String, Long> getOrderCountsByStatus();
    Map<String, Long> getOrderCountsByStatus(String tableNumber, LocalDateTime startDate, LocalDateTime endDate);
}
