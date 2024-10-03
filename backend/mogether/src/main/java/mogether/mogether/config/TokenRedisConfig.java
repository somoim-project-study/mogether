package mogether.mogether.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;

@Configuration
public class TokenRedisConfig {

    @Value("${spring.redis.token.host}")
    private String host;

    @Value("${spring.redis.token.port}")
    private int port;

    @Bean
    @Qualifier("tokenRedisConnectionFactory")
    public RedisConnectionFactory tokenRedisConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setHostName(host);
        redisStandaloneConfiguration.setPort(port);
        return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    @Bean
    @Qualifier("refreshTokenRedisTemplate")
    public RedisTemplate<String, String> refreshTokenRedisTemplate() {
        RedisTemplate<String, String> refreshTokenRedisTemplate = new RedisTemplate<>();
        refreshTokenRedisTemplate.setConnectionFactory(tokenRedisConnectionFactory());
        refreshTokenRedisTemplate.setEnableTransactionSupport(true);
        return refreshTokenRedisTemplate;
    }

    @Bean
    @Qualifier("blackListTokenRedisTemplate")
    public StringRedisTemplate blackListTokenRedisTemplate() {
        StringRedisTemplate blackListTokenRedisTemplate = new StringRedisTemplate();
        blackListTokenRedisTemplate.setConnectionFactory(tokenRedisConnectionFactory());
        blackListTokenRedisTemplate.setEnableTransactionSupport(true);
        return blackListTokenRedisTemplate;
    }
}
