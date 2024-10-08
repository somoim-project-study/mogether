package mogether.mogether.web.bungae;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mogether.mogether.application.bungae.BungaeService;
import mogether.mogether.domain.oauth.AppUser;
import mogether.mogether.web.bungae.dto.BungaeListResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "search - bungae", description = "번개 검색 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/bungae/search")
public class BungaeSearchController {

    private final BungaeService bungaeService;

    @Operation(summary = "번개 검색", description = "내용, 위치(시, 구) 기반 번개 검색",
            responses = {
                    @ApiResponse(responseCode = "200", description = "번개 검색 성공"),
            })
    @GetMapping
    public List<BungaeListResponse> search(@RequestParam(required = false) String name,
                                           @RequestParam(required = false) String city,
                                           @RequestParam(required = false) String gu,
                                           @AuthenticationPrincipal AppUser appUser) {
        return bungaeService.searchByAddress(name, city, gu, appUser);
    }
}
