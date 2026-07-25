package com.friendscafe.controller;

import com.friendscafe.dto.ApiResponse;
import com.friendscafe.dto.SettingsDto;
import com.friendscafe.service.FileStorageService;
import com.friendscafe.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SettingsController {

    private final SettingsService settingsService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<SettingsDto>> getSettings() {
        SettingsDto settings = settingsService.getSettings();
        return ResponseEntity.ok(new ApiResponse<>(true, "Settings retrieved successfully", settings));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SettingsDto>> updateSettings(@RequestBody SettingsDto settingsDto) {
        SettingsDto updatedSettings = settingsService.updateSettings(settingsDto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Settings updated successfully", updatedSettings));
    }

    @PostMapping("/upload-gallery-image")
    public ResponseEntity<ApiResponse<String>> uploadGalleryImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = fileStorageService.storeFile(file);
        return ResponseEntity.ok(new ApiResponse<>(true, "Image uploaded successfully", imageUrl));
    }
}
