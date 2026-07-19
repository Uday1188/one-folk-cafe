package com.friendscafe.controller;

import com.friendscafe.dto.ApiResponse;
import com.friendscafe.dto.OrderDto;
import com.friendscafe.dto.OrderRequest;
import com.friendscafe.entity.OrderStatus;
import com.friendscafe.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Endpoints for managing orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create a new order (Public for customers)")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        OrderDto created = orderService.createOrder(orderRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Order placed successfully", created));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders with pagination and dynamic filtering")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String tableNumber,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders fetched successfully", 
                orderService.searchOrders(status, tableNumber, search, startDate, endDate, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Order fetched successfully", orderService.getOrderById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Order status updated successfully", orderService.updateOrderStatus(id, status)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update full order")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrder(@PathVariable Long id, @Valid @RequestBody OrderRequest orderRequest) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Order updated successfully", orderService.updateOrder(id, orderRequest)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an order")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order deleted successfully", null));
    }

    @GetMapping("/filter/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Filter orders by status")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> filterByStatus(
            @RequestParam OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders fetched successfully", orderService.filterByStatus(status, pageable)));
    }

    @GetMapping("/filter/date")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Filter orders by date range")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> filterByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders fetched successfully", orderService.filterByDate(startDate, endDate, pageable)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search orders by customer name or mobile")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> searchByCustomer(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders fetched successfully", orderService.searchByCustomer(keyword, pageable)));
    }

    @GetMapping("/counts")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get total counts of orders grouped by status")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getOrderCounts() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Order counts fetched successfully", orderService.getOrderCountsByStatus()));
    }
}
