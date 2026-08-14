package com.friendscafe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductDto {
    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Full plate price is required")
    @Positive(message = "Full plate price must be greater than 0")
    private BigDecimal fullPlatePrice;

    private BigDecimal halfPlatePrice;

    private Boolean halfPlateAvailable;

    private String imageUrl;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private String categoryName;

    private Boolean available;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BigDecimal getPrice() {
        return fullPlatePrice;
    }
}
