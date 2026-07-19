package com.friendscafe.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CustomerDto {
    private Long id;
    private String name;
    private String mobile;
    private LocalDateTime createdAt;
}
