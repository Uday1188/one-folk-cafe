package com.friendscafe.controller;

import com.friendscafe.dto.ApiResponse;
import com.friendscafe.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Endpoints for dashboard analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get main dashboard metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardMetrics(@RequestParam(defaultValue = "monthly") String filter) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard metrics fetched successfully", analyticsService.getDashboardMetrics(filter)));
    }

    @GetMapping("/top-products")
    @Operation(summary = "Get top selling products")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopSellingProducts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Top products fetched successfully", analyticsService.getTopSellingProducts(limit)));
    }

    @GetMapping("/top-categories")
    @Operation(summary = "Get top products by revenue with date filters")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopProductsByRevenue(
            @RequestParam(defaultValue = "monthly") String filter,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Top products fetched successfully", analyticsService.getTopProductsByRevenue(filter, limit)));
    }
}
