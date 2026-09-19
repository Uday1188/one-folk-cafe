package com.friendscafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FriendsCafeApplication {

	public static void main(String[] args) {
		ensureDbDirectoryExists();
		SpringApplication.run(FriendsCafeApplication.class, args);
	}

	private static void ensureDbDirectoryExists() {
		try {
			String dbPath = System.getProperty("DB_PATH");
			if (dbPath == null) {
				dbPath = System.getenv("DB_PATH");
			}
			if (dbPath == null) {
				dbPath = "./data/one-folk-cafe.db";
			}
			java.io.File dbFile = new java.io.File(dbPath).getAbsoluteFile();
			java.io.File parentDir = dbFile.getParentFile();
			if (parentDir != null && !parentDir.exists()) {
				parentDir.mkdirs();
			}
		} catch (Exception ignored) {
		}
	}

}
