package com.friendscafe.controller;

import com.friendscafe.dto.ApiResponse;
import com.friendscafe.dto.AuthRequest;
import com.friendscafe.dto.AuthResponse;
import com.friendscafe.security.CustomUserDetails;
import com.friendscafe.security.CustomUserDetailsService;
import com.friendscafe.security.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for Admin login")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping("/login")
    @Operation(summary = "Login as Admin")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtProvider.generateJwtToken(authentication);
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        AuthResponse authResponse = new AuthResponse(jwt, userDetails.getUsername(), userDetails.getAdmin().getRole());
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", authResponse));
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh an expired JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "No token provided", null));
        }

        String oldToken = authHeader.substring(7);
        try {
            String username = jwtProvider.getUsernameFromExpiredToken(oldToken);
            CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);
            String newToken = jwtProvider.generateTokenForUsername(username);
            AuthResponse authResponse = new AuthResponse(newToken, userDetails.getUsername(), userDetails.getAdmin().getRole());
            return ResponseEntity.ok(new ApiResponse<>(true, "Token refreshed successfully", authResponse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Invalid or unrecoverable token. Please login again.", null));
        }
    }

    @GetMapping("/hash")
    public String hash(@RequestParam String text) {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(text);
    }
}
