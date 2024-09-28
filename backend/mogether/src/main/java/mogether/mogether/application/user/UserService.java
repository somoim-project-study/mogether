package mogether.mogether.application.user;

import lombok.RequiredArgsConstructor;
import mogether.mogether.domain.info.Gender;
import mogether.mogether.domain.oauth.AppUser;
import mogether.mogether.domain.user.*;
import mogether.mogether.exception.MogetherException;
import mogether.mogether.web.user.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import static mogether.mogether.application.user.TemporaryPasswordGenerator.*;
import static mogether.mogether.application.user.UserValidator.*;
import static mogether.mogether.application.user.UserValidator.checkPasswordPattern;
import static mogether.mogether.exception.ErrorCode.*;

@Transactional
@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProfileImageService profileImageService;
    private final RedisUserRepository redisUserRepository;

    public UserJoinResponse join(UserJoinRequest userJoinRequest, MultipartFile image) {
        checkEmailExists(userJoinRequest.getEmail());
        checkPasswordPattern(userJoinRequest.getPassword());

        User user = userJoinRequest.toUser();
        User savedUser = userRepository.save(user);
        profileImageService.save(user, image);

        return UserJoinResponse.of(savedUser);
    }

    public UserUpdateResponse update(Long userId, AppUser appUser,
                                     UserUpdateRequest userUpdateRequest, MultipartFile image) {
        validateUser(userId, appUser.getId());
        User findUser = findById(userId);

        profileImageService.update(findUser, image);
        updateUser(userUpdateRequest, findUser);
        redisUserRepository.update(UserCache.of(findUser));
        return UserUpdateResponse.of(findUser);
    }

    public void updatePassword(Long userId, AppUser appUser, PasswordUpdateRequest passwordUpdateRequest) {
        validateUser(userId, appUser.getId());

        User findUser = findById(userId);
        validateExpasswordSameness(findUser.getPassword(), encodePassword(passwordUpdateRequest.getExPassword()));
        checkPasswordPattern(passwordUpdateRequest.getNewPassword());

        findUser.updatePassword(encodePassword(passwordUpdateRequest.getNewPassword()));
    }

    public PasswordFindResponse findPassword(PasswordFindRequest request) {
        User findUser = userRepository.findByEmailAndNickname(request.getEmail(), request.getNickname())
                .orElseThrow(() -> new MogetherException(USER_NOT_FOUND));

        String temporaryPassword = generateTemporaryPassword();
        findUser.updatePassword(encodePassword(temporaryPassword));
        return PasswordFindResponse.of(temporaryPassword);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserInfo(Long userId) {
        User findUser = findById(userId);
        return UserResponse.of(findUser);
    }

    public void quit(Long userId, AppUser appUser) {
        validateUser(userId, appUser.getId());
        userRepository.deleteById(userId);
    }

    public UserJoinResponse addInfoAfterOAuthSignUp(Long userId, MultipartFile image, AfterOAuthSignUpRequest request) {
        User findUser = findById(userId);
        findUser.update(
                findUser.getNickname(), request.getAddress(), request.getAge(),
                Gender.of(request.getGender()), request.getIntro(), request.getPhoneNumber()
        );

        profileImageService.save(findUser, image);
        return UserJoinResponse.of(findUser);
    }

    @Transactional(readOnly = true)
    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new MogetherException(USER_NOT_FOUND));
    }

    private void checkEmailExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new MogetherException(EMAIL_ALREADY_EXISTS);
        }
    }

    private static void updateUser(UserUpdateRequest userUpdateRequest, User findUser) {
        findUser.update(
                userUpdateRequest.getNickname(),
                userUpdateRequest.getAddress(),
                userUpdateRequest.getAge(),
                Gender.of(userUpdateRequest.getGender()),
                userUpdateRequest.getIntro(),
                userUpdateRequest.getPhoneNumber()
        );
    }

    private void validateExpasswordSameness(String realPassword, String requestedPassword) {
        if (!realPassword.equals(requestedPassword)) {
            throw new MogetherException(PASSWORD_NOT_MATCH);
        }
    }
}
