package mogether.mogether.web.moim.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MoimKickOutRequest {

    @NotNull
    private Long moimId;
    @NotNull
    private Long userId;
}
