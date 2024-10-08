package mogether.mogether.web.moim.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MoimJoinRequest {

    @NotNull
    private Long moimId;
    @NotNull
    private Long userId;
}
