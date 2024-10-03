package mogether.mogether.config;

import mogether.mogether.domain.chat.ChatMessage;
import mogether.mogether.web.chat.RedisSubscriber;
import mogether.mogether.web.chat.dto.ChatMessageResponse;
import mogether.mogether.web.user.dto.UserCache;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class ChatRedisConfig {

    @Value("${spring.redis.chat.host}")
    private String host;

    @Value("${spring.redis.chat.port}")
    private int port;

    @Bean
    @Primary
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(chatRedisConnectionFactory());
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new Jackson2JsonRedisSerializer<>(Object.class)); // Default serializer
        return redisTemplate;
    }

    @Bean
    @Qualifier("chatRedisConnectionFactory")
    public RedisConnectionFactory chatRedisConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setHostName(host);
        redisStandaloneConfiguration.setPort(port);
        return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    @Bean
    @Qualifier("chatRedisTemplate")
    public RedisTemplate<String, ChatMessageResponse> chatRedisTemplate() {
        RedisTemplate<String, ChatMessageResponse> chatRedisTemplate = new RedisTemplate<>();
        chatRedisTemplate.setConnectionFactory(chatRedisConnectionFactory());
        chatRedisTemplate.setKeySerializer(new StringRedisSerializer());
        chatRedisTemplate.setValueSerializer(new Jackson2JsonRedisSerializer<>(ChatMessageResponse.class));
        return chatRedisTemplate;
    }

    @Bean
    @Qualifier("chatMessageRedisTemplate")
    public RedisTemplate<String, ChatMessage> chatMessageRedisTemplate() {
        RedisTemplate<String, ChatMessage> chatMessageRedisTemplate = new RedisTemplate<>();
        chatMessageRedisTemplate.setConnectionFactory(chatRedisConnectionFactory());
        chatMessageRedisTemplate.setKeySerializer(new StringRedisSerializer());

        Jackson2JsonRedisSerializer<ChatMessage> serializer = new Jackson2JsonRedisSerializer<>(ChatMessage.class);
        chatMessageRedisTemplate.setHashValueSerializer(serializer);
        chatMessageRedisTemplate.setValueSerializer(serializer);
        return chatMessageRedisTemplate;
    }

    @Bean
    @Qualifier("timeRedisTemplate")
    public RedisTemplate<String, String> timeRedisTemplate() {
        RedisTemplate<String, String> timeRedisTemplate = new RedisTemplate<>();
        timeRedisTemplate.setConnectionFactory(chatRedisConnectionFactory());
        timeRedisTemplate.setKeySerializer(new StringRedisSerializer());
        timeRedisTemplate.setValueSerializer(new StringRedisSerializer());
        return timeRedisTemplate;
    }

    @Bean
    @Qualifier("userRedisTemplate")
    public RedisTemplate<String, UserCache> userRedisTemplate() {
        RedisTemplate<String, UserCache> chatMessageRedisTemplate = new RedisTemplate<>();
        chatMessageRedisTemplate.setConnectionFactory(chatRedisConnectionFactory());
        chatMessageRedisTemplate.setKeySerializer(new StringRedisSerializer());
        chatMessageRedisTemplate.setValueSerializer(new Jackson2JsonRedisSerializer<>(UserCache.class));
        return chatMessageRedisTemplate;
    }

    //Redis Channel(Topic)로 부터 메시지를 받고, 주입된 리스너들에게 비동기적으로 dispatch 하는 역할을 수행하는 컨테이너.
    //즉, 발행된 메시지 처리를 위한 리스너들을 설정할 수 있다.
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(MessageListenerAdapter listenerAdapter,
                                                                       ChannelTopic channelTopic) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(chatRedisConnectionFactory());
        container.addMessageListener(listenerAdapter, new PatternTopic("chatRoom:*"));
        return container;
    }

    //RedisMessageListenerContainer로부터 메시지를 dispatch 받고,
    //실제 메시지를 처리하는 비즈니스 로직이 담긴 Subscriber Bean을 추가해준다.
    @Bean
    public MessageListenerAdapter listenerAdapter(RedisSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "onMessage");
    }

    @Bean
    public ChannelTopic channelTopic() {
        return new ChannelTopic("chatRoom:*");
    }
}