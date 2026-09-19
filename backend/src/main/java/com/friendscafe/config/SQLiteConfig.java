package com.friendscafe.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.io.File;

@Configuration
@Profile("sqlite")
public class SQLiteConfig {

    private static final Logger log = LoggerFactory.getLogger(SQLiteConfig.class);

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @PostConstruct
    public void ensureDatabaseDirectoryExists() {
        try {
            if (datasourceUrl != null && datasourceUrl.startsWith("jdbc:sqlite:")) {
                String dbFilePath = datasourceUrl.substring("jdbc:sqlite:".length());
                File dbFile = new File(dbFilePath).getAbsoluteFile();
                File parentDir = dbFile.getParentFile();
                if (parentDir != null && !parentDir.exists()) {
                    boolean created = parentDir.mkdirs();
                    log.info("Created SQLite database directory: {} (success: {})", parentDir.getAbsolutePath(), created);
                }
                log.info("SQLite database location: {}", dbFile.getAbsolutePath());
            }
        } catch (Exception e) {
            log.warn("Could not ensure database directory exists for URL: {}", datasourceUrl, e);
        }
    }
}
