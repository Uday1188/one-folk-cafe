package com.friendscafe.scheduler;

import com.friendscafe.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationCleanupScheduler {

    private final NotificationRepository notificationRepository;

    // Runs every hour at minute 0
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupOldReadNotifications() {
        log.info("Running scheduled cleanup of old read notifications...");
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        notificationRepository.deleteOldReadNotifications(cutoff);
        log.info("Cleanup complete for notifications older than: {}", cutoff);
    }
}
