package mogether.mogether.scheduler;

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
public class ChatMessageScheduler {

    private final ChatMessageRepository chatMessageRepository;
    private final RedisChatMessageRepository redisChatMessageRepository;
    private final LastSyncTimeRepository lastSyncTimeRepository;

    @Transactional
//    @Scheduled(cron = "0 0 4 * * *") //매일 4AM Redis-MySQL 동기화 작업
//    @Scheduled(cron = "0 * * * * *")
    @Scheduled(fixedRate = 60000)
    public void applyToRDB() {
        log.info("### Scheduler 실행");

        System.out.println();
        System.out.println("### Scheduler 실행 by Sout");


        LocalDateTime lastSyncTime = getLastSyncTime();

        log.info("### localdateTime - {}", lastSyncTime);

        List<ChatMessage> newMessages = redisChatMessageRepository.findMessagesAfter(lastSyncTime);

        chatMessageRepository.saveAll(newMessages);
        updateLastSyncTime();
    }

    private LocalDateTime getLastSyncTime() {
        String lastSyncTime = lastSyncTimeRepository.getLastSyncTime();
        log.info("### String - {}", lastSyncTime);

        return TimeConverter.toLocalDateTime(lastSyncTime);
    }

    private void updateLastSyncTime() {
        String currentTime = TimeConverter.toString(LocalDateTime.now());

        log.info("### String - {}", currentTime);

        lastSyncTimeRepository.updateLastSyncTime(currentTime);
    }
}
