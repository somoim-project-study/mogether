package mogether.mogether.web.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mogether.mogether.domain.user.User;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserCache implements Serializable {

    private Long senderId;
    private String senderNickname;
    private String senderImageUrl;

    public static UserCache of(User user) {
        return new UserCache(user.getId(), user.getNickname(), user.getImageUrl());
    }
}
