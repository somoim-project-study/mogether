import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { AppDispatch, RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { selectAuthLoading, selectIsAuthenticated, kakaoRegister, googleRegister } from '../../store/slices/authSlice';
import { registerUser } from "../../store/slices/userProfileSlice";
import { FaCamera } from "react-icons/fa";
import GoogleRedirectUrlPage from "./GoogleRedirectUrlPage";
import KakaoRedirectUrlPage from "./KakaoRedirectUrlPage";
import {locations} from "../../utils/location";

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #ccc;
  background-color: #fff;

  @media (max-width: 768px) {
    max-width: 80%;
  }
`;

const RegisterBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const InputWrapper = styled.div`
  width: 100%;
  margin: 10px;
  position: relative;
  display: flex;
`;

const Input = styled.input<{ isValid?: boolean }>`
  padding: 10px;
  width: 100%;
  border: 1px solid
    ${({ isValid }) =>
      isValid !== undefined ? (isValid ? "#ccc" : "red") : "#ccc"};
  border-radius: 5px;
  justify-content: center;
`;

const Select = styled.select<{ isValid?: boolean }>`
  padding: 10px;
  width: 100%;
  border: 1px solid
    ${({ isValid }) =>
      isValid !== undefined ? (isValid ? "#ccc" : "red") : "#ccc"};
  border-radius: 5px;
  background-color: #fff;
  appearance: none;
  cursor: pointer;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #7848f4;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SocialButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
  width: 100%;
  padding: 10px;
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background-color: #fff;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  width: 48%;
  img {
    margin-right: 8px;
    width: 20px;
    height: 20px;
  }
`;

const KakaoButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background-color: #ffe812;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  width: 48%;
  img {
    margin-right: 8px;
    width: 20px;
    height: 20px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 2px;
  font-size: 0.8em;
  position: absolute;
  top: 100%;
  left: 0;
`;

const ImageWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const UserImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
`;

const CameraIcon = styled(FaCamera)`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #fff;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImageWrapper2 = styled.img`
  display: flex;
  width: 100%;
  margin-top: 10px;
`;

const LocationWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 70%;
  box-sizing: border-box;
  gap: 15px;
`;



const Register: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [address, setAddress] = useState<{ city: string; gu: string; details: string }>({ city: "", gu: "", details: "" });
  const [age, setAge] = useState<number>(0);
  const [gender, setGender] = useState<string>("");
  const [intro, setIntro] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const error = useSelector((state: RootState) => state.auth.error);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setEmail(value);
    setEmailError(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "올바르지 않은 이메일 형식입니다");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setPassword(value);
    setPasswordError(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
      ? null
      : "비밀번호는 8자 대소문자와 특수문자, 숫자의 조합으로 이루어져야 합니다"
    );
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setNickname(value);
    setNicknameError(value.length >= 2 ? null : "두 글자 이상 입력해주세요");
  };

  const handleRegister = async () => {
    if (emailError === null && passwordError === null && email && password && gender) {
      const registerForm = { email, password, name, nickname, address, age, gender, intro, phoneNumber };
      const registerFormData = new FormData();
      registerFormData.append('dto', new Blob([JSON.stringify(registerForm)], { type: 'application/json' }));
      if (profileImage) registerFormData.append('image', profileImage);

      try {
        await dispatch(registerUser(registerFormData)).unwrap();
        Swal.fire('success', '회원가입에 성공하였습니다.', 'success');
        navigate("/login");
      } catch (error: any) {
        Swal.fire('error', error?.response?.status === 409 ? '이미 존재하는 계정입니다.' : '회원가입에 실패하였습니다.', 'error');
      }
    } else {
      Swal.fire('error', '필수 요청 사항을 모두 입력해 주세요', 'error');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfileImage(file);
  };

  return (
    <RegisterContainer>
      <h2>Register</h2>
      <RegisterBox>
        <ImageWrapper>
          <UserImage
            src={profileImage ? URL.createObjectURL(profileImage) : "https://via.placeholder.com/100?text=User+Image"}
            alt="User Profile"
            onClick={() => document.getElementById("fileInput")?.click()}
          />
          <CameraIcon onClick={() => document.getElementById("fileInput")?.click()} />
          <HiddenFileInput id="fileInput" type="file" accept="image/*" onChange={handleImageChange} />
        </ImageWrapper>
        <InputWrapper>
          <Input type="text" placeholder="Nickname" value={nickname} onChange={handleNicknameChange} isValid={nicknameError === null} />
          {nicknameError && <ErrorMessage>{nicknameError}</ErrorMessage>}
        </InputWrapper>
        <InputWrapper>
          <Input type="email" placeholder="Email" value={email} onChange={handleEmailChange} isValid={emailError === null} />
          {emailError && <ErrorMessage>{emailError}</ErrorMessage>}
        </InputWrapper>
        <InputWrapper>
          <Input type="password" placeholder="Password (at least 8 characters)" value={password} onChange={handlePasswordChange} isValid={passwordError === null} />
          {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
        </InputWrapper>
        <LocationWrapper>
          <Select value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value, gu: "" })}>
            <option value="">행정시를 선택하세요</option>
            {locations.map((loc) => <option key={loc.name} value={loc.name}>{loc.name}</option>)}
          </Select>
          <Select value={address.gu} onChange={(e) => setAddress({ ...address, gu: e.target.value })} disabled={!address.city}>
            <option value="">행정구를 선택하세요</option>
            {locations.find((loc) => loc.name === address.city)?.subArea.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </Select>
        </LocationWrapper>
        <InputWrapper>
          <Input type="text" placeholder="Details" value={address.details} onChange={(e) => setAddress({ ...address, details: e.target.value })} isValid={true} />
        </InputWrapper>
        <InputWrapper>
          <Input type="number" placeholder="Age" value={age} onChange={(e) => setAge(parseInt(e.target.value))} isValid={true} />
        </InputWrapper>
        <InputWrapper>
          <Select value={gender} onChange={(e) => setGender(e.target.value)} isValid={true}>
            <option value="" disabled>성별</option>
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
          </Select>
        </InputWrapper>
        <InputWrapper>
          <Input type="text" placeholder="Intro" value={intro} onChange={(e) => setIntro(e.target.value)} isValid={true} />
        </InputWrapper>
        <InputWrapper>
          <Input type="text" placeholder="010-xxxx-xxxx 형식으로 입력해 주세요" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} isValid={true} />
        </InputWrapper>
        <Button onClick={handleRegister}>Register</Button>
        <ImageWrapper2 src={require("../../assets/OR.png")} />
        <SocialButtonsContainer>
          <SocialButton onClick={() => window.location.href = 'https://api.mo-gether.site/oauth2/authorization/google'}>
            <img src={require("../../assets/Google__G__logo 1.png")} alt="Google Logo" />
            Google로 회원가입
          </SocialButton>
          <KakaoButton onClick={() => window.location.href = 'https://api.mo-gether.site/oauth2/authorization/kakao'}>
            <img src={require("../../assets/KakaoTalk_logo 1.png")} alt="Kakao Logo" />
            Kakao로 회원가입
          </KakaoButton>
        </SocialButtonsContainer>
      </RegisterBox>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </RegisterContainer>
  );
};

export default Register;
