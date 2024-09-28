package mogether.mogether.domain.user;

import mogether.mogether.exception.MogetherException;
import mogether.mogether.web.user.dto.UserCache;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Repository;

import java.util.*;

import static mogether.mogether.exception.ErrorCode.*;

@Repository
public class RedisUserRepository {

    private static final String USER_KEY_PREFIX = "user:";

    private final RedisTemplate<String, UserCache> userRedisTemplate;
    private final ValueOperations<String, UserCache> valueOperations;
    private final UserRepository userRepository;

    public RedisUserRepository(@Qualifier("userRedisTemplate") RedisTemplate<String, UserCache> userRedisTemplate,
                               UserRepository userRepository) {
        this.userRedisTemplate = userRedisTemplate;
        valueOperations = userRedisTemplate.opsForValue();
        this.userRepository = userRepository;
    }

    public String getUserKey(Long userId) {
        return USER_KEY_PREFIX + userId;
    }

    public UserCache findById(Long userId) {
        Optional<UserCache> findUserCache = Optional.ofNullable(valueOperations.get(getUserKey(userId)));

        if (findUserCache.isPresent()) {
            return findUserCache.get();
        } else {
            User findUser = userRepository.findById(userId)
                    .orElseThrow(() -> new MogetherException(USER_NOT_FOUND));
            UserCache userCache = UserCache.of(findUser);
            return save(userCache);
        }
    }

    public List<UserCache> findAll() {
        Set<String> keys = userRedisTemplate.keys(USER_KEY_PREFIX + "*");

        return Objects.requireNonNull(keys)
                .stream()
                .map(valueOperations::get)
                .toList();
    }

    public UserCache save(UserCache userCache) {
        String userKey = getUserKey(userCache.getSenderId());
        valueOperations.set(userKey, userCache);
        return userCache;
    }

    public void update(UserCache userCache) {
        String userKey = getUserKey(userCache.getSenderId());
        valueOperations.set(userKey, userCache);
    }

    public void clearAll() {
        Set<String> userKeys = userRedisTemplate.keys(USER_KEY_PREFIX + "*");
        if (userKeys != null) {
            for (String userKey : userKeys) {
                userRedisTemplate.delete(userKey);  // Delete each room key
            }
        }
    }

    public void deleteById(Long userId) {
        valueOperations.getAndDelete(getUserKey(userId));
    }
}