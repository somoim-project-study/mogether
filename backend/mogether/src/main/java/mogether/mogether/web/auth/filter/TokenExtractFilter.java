package mogether.mogether.web.auth.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import mogether.mogether.domain.token.TokenProvider;
import mogether.mogether.exception.ErrorCode;
import mogether.mogether.exception.MogetherException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

import static mogether.mogether.domain.token.TokenInfo.ACCESS_TOKEN;
import static mogether.mogether.web.auth.util.PathMatcher.*;
import static mogether.mogether.web.auth.util.TokenExtractor.hasTokenHeader;

@Slf4j
@Component
public class TokenExtractFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (isPermittedURI(request) || (isForAnonymousURI(request)) && !hasTokenHeader(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        HttpServletRequestWrapper requestWrapper = new HttpServletRequestWrapper(request) {
            private final Map<String, String> customHeaders = new HashMap<>();

            @Override
            public String getHeader(String name) {
                if (customHeaders.containsKey(name)) {
                    return customHeaders.get(name);
                }

                if (ACCESS_TOKEN.equalsIgnoreCase(name)) {
                    if (super.getHeader(name) == null) {
                        log.info("required token is missing");
                        throw new MogetherException(ErrorCode.REQUIRED_TOKEN_MISSING);
                    }

//                    String modifiedToken = TokenProvider.replaceBearerToToken(super.getHeader(name));
//                    if (modifiedToken != null) {
//                        customHeaders.put(name, modifiedToken);
//                        return modifiedToken;
//                    }
                }

                return super.getHeader(name);
            }

            @Override
            public Enumeration<String> getHeaderNames() {
                List<String> headerNames = Collections.list(super.getHeaderNames());
                headerNames.addAll(customHeaders.keySet());
                return Collections.enumeration(headerNames);
            }

            @Override
            public Enumeration<String> getHeaders(String name) {
                if (customHeaders.containsKey(name)) {
                    return Collections.enumeration(Collections.singletonList(customHeaders.get(name)));
                }
                return super.getHeaders(name);
            }
        };

        filterChain.doFilter(requestWrapper, response);
    }
}