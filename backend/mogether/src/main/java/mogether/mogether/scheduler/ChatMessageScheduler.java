package mogether.mogether.scheduler;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import mogether.mogether.domain.TimeConverter;
import mogether.mogether.domain.chat.ChatMessage;
import mogether.mogether.domain.chat.ChatMessageRepository;
import mogether.mogether.domain.chat.LastSyncTimeRepository;
import mogether.mogether.domain.chat.RedisChatMessageRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@Transactional
public class ChatMessageScheduler {

    private final ChatMessageRepository chatMessageRepository;
    private final RedisChatMessageRepository redisChatMessageRepository;
    private final LastSyncTimeRepository lastSyncTimeRepository;
//    private final LettuceConnectionFactory chatRedisConnectionFactory;
//    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    public ChatMessageScheduler(ChatMessageRepository chatMessageRepository,
                                RedisChatMessageRepository redisChatMessageRepository,
                                LastSyncTimeRepository lastSyncTimeRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.redisChatMessageRepository = redisChatMessageRepository;
        this.lastSyncTimeRepository = lastSyncTimeRepository;
//        this.chatRedisConnectionFactory = chatRedisConnectionFactory;
    }

    @Scheduled(cron = "0 0 4 * * *") //매일 4AM Redis-MySQL 동기화 작업
//    @Scheduled(cron = "0 * * * * *")
    public void applyToRDB() {
        log.info("### Scheduler 실행");
        LocalDateTime lastSyncTime = getLastSyncTime();
        List<ChatMessage> newMessages = redisChatMessageRepository.findMessagesAfter(lastSyncTime);

        log.info("### lastSyncTime : {}", lastSyncTime);
        log.info("### new messages : {}", newMessages.size());

        chatMessageRepository.saveAll(newMessages);
        updateLastSyncTime();
    }

    private LocalDateTime getLastSyncTime() {
        String lastSyncTime = lastSyncTimeRepository.getLastSyncTime();
        return TimeConverter.toLocalDateTime(lastSyncTime);
    }

    private void updateLastSyncTime() {
        String currentTime = TimeConverter.toString(LocalDateTime.now());
        lastSyncTimeRepository.updateLastSyncTime(currentTime);
    }

//    @PreDestroy
//    public void persistChatMessagesOnShutdown() {
//        executorService.submit(() -> {
//            try {
//                chatRedisConnectionFactory.start();
//                applyToRDB();
//            } catch (Exception e) {
//                log.error("### {}", e.getMessage());
//            }
//        });
//
//        shutdownExecutorAndRedisConnection();
//    }
//
//    // Helper method to shut down the executor service and Redis connection
//    private void shutdownExecutorAndRedisConnection() {
//        // Shutdown the executor service and wait for the task to complete
//        executorService.shutdown();
//        try {
//            // Wait for the persistence task to complete
//            if (!executorService.awaitTermination(30, TimeUnit.SECONDS)) {
//                executorService.shutdownNow(); // Force shutdown if not done in 30 seconds
//            }
//
//            // After task completion, shut down Redis connection
//            if (chatRedisConnectionFactory != null && chatRedisConnectionFactory.isRunning()) {
//                chatRedisConnectionFactory.stop();
//                System.out.println("Redis connection stopped.");
//            }
//
//        } catch (InterruptedException ie) {
//            executorService.shutdownNow();
//            Thread.currentThread().interrupt();
//        }
//    }
//
////    @PostConstruct
//    public void retrieveChatMessage() {
//        System.out.println("### PostConstruct 실행");
//        redisChatMessageRepository.clearAll();
//        List<ChatMessage> chatMessageList = chatMessageRepository.findAll();
//        redisChatMessageRepository.saveAllToRedis(chatMessageList);
//
//        System.out.println("### PostConstruct 실행");
//    }
}
