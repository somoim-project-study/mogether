package mogether.mogether.domain.chat;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static mogether.mogether.domain.TimeConverter.toLocalDateTime;

@Slf4j
@Repository
public class RedisChatMessageRepository {

    private static final String ROOM_KEY_PREFIX = "chatMessage:room:";

    private final RedisTemplate<String, ChatMessage> chatMessageRedisTemplate;
    private final HashOperations<String, String, ChatMessage> hashOperations;
    //todo: hash -> list

    public RedisChatMessageRepository(@Qualifier("chatMessageRedisTemplate") RedisTemplate<String, ChatMessage> chatMessageRedisTemplate) {
        this.chatMessageRedisTemplate = chatMessageRedisTemplate;
        this.hashOperations = chatMessageRedisTemplate.opsForHash();
    }

    public List<ChatMessage> findByRoomId(Long roomId) {
        String roomKey = getRoomKey(String.valueOf(roomId));
        return hashOperations.values(roomKey);
    }

    public void save(ChatMessage chatMessage) {
        log.info("### chatMessage: {}", chatMessage.getMessage());
        log.info("### createdAt: {}", chatMessage.getCreatedAt());

        String roomKey = getRoomKey(chatMessage.getRoomId());
        hashOperations.put(roomKey, chatMessage.getId(), chatMessage);
    }

    public List<ChatMessage> findMessagesAfter(LocalDateTime lastSyncTime) {
        Set<String> roomKeys = chatMessageRedisTemplate.keys(ROOM_KEY_PREFIX + "*");

        if (roomKeys == null || roomKeys.isEmpty()) {
            return new ArrayList<>();
        }

        return roomKeys.stream()
                .flatMap(roomKey -> hashOperations.values(roomKey).stream())
                .filter(message -> toLocalDateTime(message.getCreatedAt()).isAfter(lastSyncTime) || toLocalDateTime(message.getCreatedAt()).isEqual(lastSyncTime))
                .toList();
    }

    private String getRoomKey(String roomId) {
        return ROOM_KEY_PREFIX + roomId;
    }

    public void clearAll() {
        Set<String> roomKeys = chatMessageRedisTemplate.keys(ROOM_KEY_PREFIX + "*");
        if (roomKeys != null) {
            for (String roomKey : roomKeys) {
                chatMessageRedisTemplate.delete(roomKey);
            }
        }
    }

    public void saveAllToRedis(List<ChatMessage> messages) {
        for (ChatMessage message : messages) {
            String roomKey = getRoomKey(message.getRoomId());
            hashOperations.put(roomKey, message.getId(), message);
        }
    }

    public void deleteById(String roomId, String id) {
        hashOperations.delete(getRoomKey(roomId), id);
    }

    public List<ChatMessage> findAll() {
        Set<String> roomKeys = chatMessageRedisTemplate.keys(ROOM_KEY_PREFIX + "*");
        List<ChatMessage> chatMessages = new ArrayList<>();

        if (roomKeys != null) {
            for (String roomKey : roomKeys) {
                chatMessages.addAll(hashOperations.values(roomKey));
            }
        }

        return chatMessages;
    }
}
