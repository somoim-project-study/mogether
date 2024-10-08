package mogether.mogether.web.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Token {

    private String accessToken;
    private String refreshToken;
    private Long userId;
}