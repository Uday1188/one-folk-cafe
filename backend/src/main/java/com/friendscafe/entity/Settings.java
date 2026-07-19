package com.friendscafe.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cafe_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settings {

    @Id
    private Long id; // Will always be 1

    @Column(name = "cafe_name", nullable = false)
    private String cafeName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 50)
    private String phone;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name = "open_time", nullable = false, length = 20)
    private String openTime;

    @Column(name = "close_time", nullable = false, length = 20)
    private String closeTime;

    @Column(name = "instagram_link")
    private String instagramLink;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "our_story_image", columnDefinition = "TEXT")
    private String ourStoryImage;

    @jakarta.persistence.ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @jakarta.persistence.CollectionTable(name = "settings_featured_products", joinColumns = @jakarta.persistence.JoinColumn(name = "settings_id"))
    @Column(name = "product_id")
    private java.util.List<Long> featuredProductIds;
}
