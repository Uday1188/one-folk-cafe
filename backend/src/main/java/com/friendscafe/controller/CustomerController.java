package com.friendscafe.controller;

import com.friendscafe.dto.ApiResponse;
import com.friendscafe.dto.CustomerDto;
import com.friendscafe.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Endpoints for managing customers")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all customers")
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getAllCustomers() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Customers fetched successfully", customerService.getAllCustomers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<ApiResponse<CustomerDto>> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer fetched successfully", customerService.getCustomerById(id)));
    }

    @PostMapping
    @Operation(summary = "Register or login a customer by mobile number")
    public ResponseEntity<ApiResponse<CustomerDto>> createCustomer(@RequestBody CustomerDto customerDto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer registered successfully", customerService.createCustomer(customerDto)));
    }
}
