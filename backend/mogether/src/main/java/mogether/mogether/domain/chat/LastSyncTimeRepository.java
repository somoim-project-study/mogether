package mogether.mogether.domain.chat;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Repository;

@Repository
public class LastSyncTimeRepository {

    private static final String KEY = "lastSyncTime";

    private final RedisTemplate<String, String> timeRedisTemplate;
    private final ValueOperations<String, String> valueOperations;

    public LastSyncTimeRepository(@Qualifier("timeRedisTemplate") RedisTemplate<String, String> timeRedisTemplate) {
        this.timeRedisTemplate = timeRedisTemplate;
        this.valueOperations = timeRedisTemplate.opsForValue();
    }

    public String getLastSyncTime() {
        return valueOperations.get(KEY);
    }

    public void updateLastSyncTime(String now) {
        valueOperations.set(KEY, now);
    }
}