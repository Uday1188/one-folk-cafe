package com.friendscafe.controller;

import com.friendscafe.dto.ApiResponse;
import com.friendscafe.dto.CategoryDto;
import com.friendscafe.dto.ProductDto;
import com.friendscafe.dto.SettingsDto;
import com.friendscafe.service.CategoryService;
import com.friendscafe.service.ProductService;
import com.friendscafe.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/publish-menu")
@RequiredArgsConstructor
@Tag(name = "Menu Publishing", description = "Endpoints for exporting and publishing sanitized public menu data")
public class MenuPublishController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final SettingsService settingsService;

    @GetMapping("/preview")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Preview sanitized public menu data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> previewMenu() {
        Map<String, Object> publicData = buildPublicMenuData();
        return ResponseEntity.ok(new ApiResponse<>(true, "Public menu data generated", publicData));
    }

    @PostMapping("/export-local")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export sanitized menu JSON to local public_menu.json file")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportLocal() {
        try {
            Map<String, Object> publicData = buildPublicMenuData();
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(publicData);
            
            File outputFile = new File("./data/public_menu.json").getAbsoluteFile();
            File parent = outputFile.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            Files.writeString(outputFile.toPath(), json);
            
            Map<String, Object> result = new HashMap<>();
            result.put("filePath", outputFile.getAbsolutePath());
            result.put("publishedAt", publicData.get("publishedAt"));
            result.put("categoriesCount", ((List<?>) publicData.get("categories")).size());
            result.put("productsCount", ((List<?>) publicData.get("products")).size());
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Public menu exported successfully to " + outputFile.getAbsolutePath(), result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, "Failed to export menu: " + e.getMessage(), null));
        }
    }

    private Map<String, Object> buildPublicMenuData() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        List<ProductDto> products = productService.getAllProducts();
        SettingsDto settings = settingsService.getSettings();

        Map<String, Object> publicData = new HashMap<>();
        publicData.put("publishedAt", LocalDateTime.now().toString());
        publicData.put("cafeName", settings != null ? settings.getCafeName() : "One Folk Cafe");
        publicData.put("settings", settings);
        publicData.put("categories", categories);
        publicData.put("products", products);
        return publicData;
    }
}
