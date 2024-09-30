package mogether.mogether.application.chat;

import lombok.RequiredArgsConstructor;
import mogether.mogether.domain.chat.ChatMessage;
import mogether.mogether.domain.chat.ChatRoom;
import mogether.mogether.domain.chat.RedisChatMessageRepository;
import mogether.mogether.domain.user.RedisUserRepository;
import mogether.mogether.domain.user.User;
import mogether.mogether.web.chat.*;
import mogether.mogether.web.chat.dto.ChatMessageRequest;
import mogether.mogether.web.chat.dto.ChatMessageResponse;
import mogether.mogether.web.chat.dto.ChatRoomListResponse;
import mogether.mogether.web.chat.dto.ChatRoomResponse;
import mogether.mogether.web.user.dto.UserCache;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Transactional
@Service
public class ChatService {

    private final ChatRoomService chatRoomService;
    private final RedisChatMessageRepository redisChatMessageRepository;
    private final RedisUserRepository redisUserRepository;
    private final RedisPublisher redisPublisher;

    public void sendMessage(ChatMessageRequest request) {
        UserCache user = redisUserRepository.findById(request.getSenderId());

        //채팅 생성/저장
        ChatMessage chatMessage = createChatMessage(request, user);
        redisChatMessageRepository.save(chatMessage);

        String topic = createTopic(chatMessage.getRoomId());
        ChatMessageResponse chatMessageResponse = ChatMessageResponse.of(chatMessage);

        //publish
        redisPublisher.publish(topic, chatMessageResponse);
    }

    @Transactional(readOnly = true)
    public ChatRoomResponse getChatRoom(Long roomId) {
        ChatRoom chatRoom = chatRoomService.findById(roomId);
        List<User> participants = chatRoomService.findJoinUsers(roomId);
        List<ChatMessage> chatMessageList = redisChatMessageRepository.findByRoomId(roomId);
        return ChatRoomResponse.of(chatRoom, chatMessageList, participants);
    }

    @Transactional(readOnly = true)
    public List<ChatRoomListResponse> getChatRoomList(Long userId) {
        List<ChatRoom> chatRoomList = chatRoomService.findChatRoomList(userId);
        return ChatRoomListResponse.of(chatRoomList);
    }

    private String createTopic(String roomId) {
        return "chatRoom:" + roomId;
    }

    private ChatMessage createChatMessage(ChatMessageRequest request, UserCache user) {
        return ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .roomId(String.valueOf(request.getRoomId()))
                .senderId(String.valueOf(user.getSenderId()))
                .senderNickname(user.getSenderNickname())
                .senderImageUrl(user.getSenderImageUrl())
                .message(request.getMessage())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
