package mogether.mogether.domain.chat;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ChatMessage implements Serializable {

    @Id
    private String id;

    private String roomId;
    private String senderId;
    private String senderNickname;
    private String senderImageUrl;
    private String message;

    private String createdAt;
}