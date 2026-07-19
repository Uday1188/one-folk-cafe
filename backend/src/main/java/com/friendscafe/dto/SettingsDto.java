package com.friendscafe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingsDto {
    private String cafeName;
    private String address;
    private String phone;
    private String email;
    private String openTime;
    private String closeTime;
    private String instagramLink;
    private String description;
    private String ourStoryImage;
    private java.util.List<Long> featuredProductIds;
}
