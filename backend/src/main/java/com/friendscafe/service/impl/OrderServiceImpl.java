package com.friendscafe.service.impl;

import com.friendscafe.dto.OrderDto;
import com.friendscafe.dto.OrderItemRequest;
import com.friendscafe.dto.OrderRequest;
import com.friendscafe.entity.*;
import com.friendscafe.exception.ResourceNotFoundException;
import com.friendscafe.mapper.OrderMapper;
import com.friendscafe.repository.CustomerRepository;
import com.friendscafe.repository.NotificationRepository;
import com.friendscafe.repository.OrderRepository;
import com.friendscafe.repository.ProductRepository;
import com.friendscafe.repository.CafeTableRepository;
import com.friendscafe.service.OrderService;
import com.friendscafe.specification.OrderSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final NotificationRepository notificationRepository;
    private final CafeTableRepository cafeTableRepository;
    private final OrderMapper orderMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public OrderDto createOrder(OrderRequest orderRequest) {
        Customer customer = null;
        if (orderRequest.getCustomerMobile() != null && !orderRequest.getCustomerMobile().isBlank()) {
            Optional<Customer> existingCustomer = customerRepository.findFirstByMobileOrderByIdDesc(orderRequest.getCustomerMobile());
            if (existingCustomer.isPresent()) {
                customer = existingCustomer.get();
                // Update name if it has changed
                if (orderRequest.getCustomerName() != null && !customer.getName().equals(orderRequest.getCustomerName())) {
                    customer.setName(orderRequest.getCustomerName());
                    customer = customerRepository.save(customer);
                }
            } else {
                customer = Customer.builder()
                        .name(orderRequest.getCustomerName() != null ? orderRequest.getCustomerName() : "Guest")
                        .mobile(orderRequest.getCustomerMobile())
                        .build();
                customer = customerRepository.save(customer);
            }
        }

        String tableNum = (orderRequest.getTableNumber() != null && !orderRequest.getTableNumber().isBlank()) 
                ? orderRequest.getTableNumber().trim() 
                : "Walk-in";

        // Initialize Order
        Order order = Order.builder()
                .customer(customer)
                .tableNumber(tableNum)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : orderRequest.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));
            
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())
                    .build();
            
            order.addItem(orderItem);
            
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            total = total.add(itemTotal);
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);
        
        // Save and send notification
        String tableMsg = "Walk-in".equalsIgnoreCase(savedOrder.getTableNumber()) 
                ? "Walk-in Customer" 
                : "Table " + savedOrder.getTableNumber();
        Notification notification = Notification.builder()
                .message("New Order Received from " + tableMsg)
                .orderId(savedOrder.getId())
                .isRead(false)
                .build();
        Notification savedNotification = notificationRepository.save(notification);
        
        messagingTemplate.convertAndSend("/topic/notifications", savedNotification);
        
        return orderMapper.toDto(savedOrder);
    }

    @Override
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(orderMapper::toDto);
    }

    @Override
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return orderMapper.toDto(order);
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDto(updatedOrder);
    }

    @Override
    @Transactional
    public OrderDto updateOrder(Long id, OrderRequest orderRequest) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        String tableNum = (orderRequest.getTableNumber() != null && !orderRequest.getTableNumber().isBlank()) 
                ? orderRequest.getTableNumber().trim() 
                : "Walk-in";
        order.setTableNumber(tableNum);
        
        // Clear existing items and recalculate total
        order.getItems().clear();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : orderRequest.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));
            
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())
                    .build();
            
            order.addItem(orderItem);
            
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            total = total.add(itemTotal);
        }

        order.setTotalAmount(total);
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDto(updatedOrder);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        orderRepository.delete(order);
    }

    @Override
    public Page<OrderDto> filterByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable).map(orderMapper::toDto);
    }

    @Override
    public Page<OrderDto> filterByDate(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return orderRepository.findByDateRange(startDate, endDate, pageable).map(orderMapper::toDto);
    }

    @Override
    public Page<OrderDto> searchByCustomer(String customerNameOrMobile, Pageable pageable) {
        return orderRepository.searchByCustomer(customerNameOrMobile, pageable).map(orderMapper::toDto);
    }

    @Override
    public Page<OrderDto> searchOrders(OrderStatus status, String tableNumber, String search, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Specification<Order> spec = OrderSpecification.getOrdersByCriteria(status, tableNumber, search, startDate, endDate);
        Page<Order> orderPage = orderRepository.findAll(spec, pageable);
        return orderPage.map(orderMapper::toDto);
    }
    
    @Override
    public Map<String, Long> getOrderCountsByStatus() {
        return getOrderCountsByStatus(null, null, null);
    }

    @Override
    public Map<String, Long> getOrderCountsByStatus(String tableNumber, LocalDateTime startDate, LocalDateTime endDate) {
        Specification<Order> spec = OrderSpecification.getOrdersByCriteria(null, tableNumber, null, startDate, endDate);
        List<Order> orders = orderRepository.findAll(spec);
        
        Map<String, Long> counts = new HashMap<>();
        counts.put("ALL", (long) orders.size());
        counts.put("PENDING", 0L);
        counts.put("COMPLETED", 0L);
        counts.put("CANCELLED", 0L);
        
        for (Order o : orders) {
            if (o.getStatus() != null) {
                String status = o.getStatus().name();
                counts.put(status, counts.getOrDefault(status, 0L) + 1L);
            }
        }
        
        return counts;
    }
}
