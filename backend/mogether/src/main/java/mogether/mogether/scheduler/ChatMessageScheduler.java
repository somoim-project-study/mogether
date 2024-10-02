package mogether.mogether.scheduler;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mogether.mogether.domain.TimeConverter;
import mogether.mogether.domain.chat.ChatMessage;
import mogether.mogether.domain.chat.ChatMessageRepository;
import mogether.mogether.domain.chat.LastSyncTimeRepository;
import mogether.mogether.domain.chat.RedisChatMessageRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Component
@Transactional
public class ChatMessageScheduler {

    private final ChatMessageRepository chatMessageRepository;
    private final RedisChatMessageRepository redisChatMessageRepository;
    private final LastSyncTimeRepository lastSyncTimeRepository;

    @Scheduled(cron = "0 0 4 * * *") //매일 4AM Redis-MySQL 동기화 작업
//    @Scheduled(cron = "0 * * * * *")
    public void applyToRDB() {
        log.info("### Scheduler 실행");
        LocalDateTime lastSyncTime = getLastSyncTime();
        List<ChatMessage> newMessages = redisChatMessageRepository.findMessagesAfter(lastSyncTime);

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

    @PreDestroy
    public void persistChatMessageCache() {
        applyToRDB();
    }

    @PostConstruct
    public void retrieveChatMessage() {
        redisChatMessageRepository.clearAll();
        List<ChatMessage> chatMessageList = chatMessageRepository.findAll();
        redisChatMessageRepository.saveAllToRedis(chatMessageList);
    }
}
