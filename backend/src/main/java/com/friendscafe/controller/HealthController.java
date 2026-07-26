package com.friendscafe.controller;

import com.friendscafe.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Backend is active and warm", "UP"));
    }
}
