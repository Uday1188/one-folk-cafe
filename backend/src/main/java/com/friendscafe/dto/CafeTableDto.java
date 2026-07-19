package com.friendscafe.dto;

import lombok.Data;

@Data
public class CafeTableDto {
    private Long id;
    private String tableNumber;
    private Integer capacity;
    private String status;
}
