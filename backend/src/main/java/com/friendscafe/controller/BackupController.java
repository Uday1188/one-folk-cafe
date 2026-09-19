package com.friendscafe.controller;

import com.friendscafe.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/backup")
@RequiredArgsConstructor
@Tag(name = "Backup", description = "Endpoints for SQLite database backup and restore")
public class BackupController {

    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.datasource.url:jdbc:sqlite:./data/one-folk-cafe.db}")
    private String datasourceUrl;

    private File getDatabaseFile() {
        if (datasourceUrl != null && datasourceUrl.startsWith("jdbc:sqlite:")) {
            String path = datasourceUrl.substring("jdbc:sqlite:".length());
            return new File(path).getAbsoluteFile();
        }
        return new File("./data/one-folk-cafe.db").getAbsoluteFile();
    }

    @GetMapping("/info")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get database file information")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBackupInfo() {
        File dbFile = getDatabaseFile();
        Map<String, Object> info = new HashMap<>();
        info.put("path", dbFile.getAbsolutePath());
        info.put("exists", dbFile.exists());
        info.put("sizeBytes", dbFile.exists() ? dbFile.length() : 0);
        info.put("lastModified", dbFile.exists() ? new Date(dbFile.lastModified()).toString() : null);
        return ResponseEntity.ok(new ApiResponse<>(true, "Database info retrieved", info));
    }

    @GetMapping("/download")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Download SQLite database backup")
    public ResponseEntity<Resource> downloadBackup() {
        File dbFile = getDatabaseFile();
        if (!dbFile.exists()) {
            return ResponseEntity.notFound().build();
        }
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String filename = "one-folk-cafe_backup_" + timestamp + ".db";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new FileSystemResource(dbFile));
    }

    @PostMapping("/export-to-path")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export database backup to a local file path")
    public ResponseEntity<ApiResponse<String>> exportToPath(@RequestBody Map<String, String> request) {
        String targetPath = request.get("targetPath");
        if (targetPath == null || targetPath.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Target path is required", null));
        }
        try {
            File targetFile = new File(targetPath).getAbsoluteFile();
            File parent = targetFile.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            String sanitizedPath = targetFile.getAbsolutePath().replace("\\", "/");
            if (targetFile.exists()) {
                targetFile.delete();
            }
            jdbcTemplate.execute("VACUUM INTO '" + sanitizedPath + "'");
            return ResponseEntity.ok(new ApiResponse<>(true, "Backup exported successfully to: " + targetFile.getAbsolutePath(), targetFile.getAbsolutePath()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, "Backup failed: " + e.getMessage(), null));
        }
    }

    @PostMapping("/restore-from-path")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Restore database from a local file path")
    public ResponseEntity<ApiResponse<String>> restoreFromPath(@RequestBody Map<String, String> request) {
        String sourcePath = request.get("sourcePath");
        if (sourcePath == null || sourcePath.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Source path is required", null));
        }
        try {
            File sourceFile = new File(sourcePath).getAbsoluteFile();
            if (!sourceFile.exists()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Source file does not exist: " + sourceFile.getAbsolutePath(), null));
            }
            File currentDb = getDatabaseFile();
            if (currentDb.exists()) {
                String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
                File preRestoreBackup = new File(currentDb.getParentFile(), "one-folk-cafe_pre_restore_" + timestamp + ".db");
                Files.copy(currentDb.toPath(), preRestoreBackup.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }
            Files.copy(sourceFile.toPath(), currentDb.toPath(), StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(new ApiResponse<>(true, "Database restored successfully from: " + sourceFile.getAbsolutePath() + ". Please restart the application to reload changes.", currentDb.getAbsolutePath()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, "Restore failed: " + e.getMessage(), null));
        }
    }
}
