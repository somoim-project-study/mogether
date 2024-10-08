package mogether.mogether.domain.user;

import jakarta.persistence.*;
import lombok.*;
import mogether.mogether.domain.chat.ChatRoomUser;
import mogether.mogether.domain.info.Address;
import mogether.mogether.domain.bungae.Bungae;
import mogether.mogether.domain.bungae.BungaeUser;
import mogether.mogether.domain.interest.bungae.BungaeInterest;
import mogether.mogether.domain.interest.moim.MoimInterest;
import mogether.mogether.domain.moim.Moim;
import mogether.mogether.domain.moim.MoimUser;
import mogether.mogether.domain.user.image.ProfileImage;
import mogether.mogether.domain.info.Gender;
import mogether.mogether.domain.info.SocialType;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.CascadeType.ALL;
import static jakarta.persistence.CascadeType.REMOVE;
import static jakarta.persistence.FetchType.LAZY;
import static lombok.AccessLevel.PROTECTED;

@Getter
@NoArgsConstructor(access = PROTECTED)
@Entity
@Table(name = "Users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = LAZY, cascade = ALL, orphanRemoval = true)
    @JoinColumn(name = "image_id")
    private ProfileImage profileImage;

    @OneToMany(mappedBy = "host", cascade = REMOVE)
    private List<Bungae> bungaeHostList = new ArrayList<>();

    @OneToMany(mappedBy = "host", cascade = REMOVE)
    private List<Moim> moimHostList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = REMOVE)
    private List<BungaeUser> bungaeJoinList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = REMOVE)
    private List<MoimUser> moimJoinList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = REMOVE)
    private List<BungaeInterest> bungaeInterestList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = REMOVE)
    private List<MoimInterest> moimInterestList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = REMOVE)
    private List<ChatRoomUser> chatRoomUserList = new ArrayList<>();

    private String imageUrl;
    private String nickname;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private SocialType socialType;
    private String socialId;

    @Embedded
    private Address address;
    private int age;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    private String intro;
    private String phoneNumber;
//    private String providerKey; //socialType과 providerId를 결합한 고유 값

    public void setProfileImage(ProfileImage profileImage) {
        this.profileImage = profileImage;
    }

    public void setImageUrl(String fileUrl) {
        this.imageUrl = fileUrl;
    }

    public void update(String nickname, Address address, int age, Gender gender, String intro, String phoneNumber) {
        this.nickname = nickname;
        this.address = address;
        this.age = age;
        this.gender = gender;
        this.intro = intro;
        this.phoneNumber = phoneNumber;
    }

    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    public User(String email, String password, SocialType socialType, String nickname, Address address, int age, Gender gender, String intro, String phoneNumber) {
        this.email = email;
        this.password = password;
        this.socialType = socialType;
        this.nickname = nickname;
        this.age = age;
        this.intro = intro;
        this.gender = gender;
        this.address = address;
        this.phoneNumber = phoneNumber;
    }

    //todo: principalDetail 수정 후 삭제 필요
    public User(Long id) {
        this.id = id;
    }

    public User(String nickname, String email, String imageUrl) {
        this.nickname = nickname;
        this.email = email;
        this.imageUrl = imageUrl;
    }

    public User(Long id, String email, String password, String nickname) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.nickname = nickname;
    }

    public User(String nickname, String email, SocialType socialType, String socialId) {
        this.email = email;
        this.socialType = socialType;
        this.socialId = socialId;
        this.nickname = nickname;
    }
}
