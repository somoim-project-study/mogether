import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styled from 'styled-components';

const SpinnerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Spinner = styled.div`
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SocialRegisterRedirectUrl: React.FC = () => {
  const navigate = useNavigate();
  let id = localStorage.getItem('userId');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userId = urlParams.get('userId') || '';
    const signUp = urlParams.get('signUp') || '';
    const strippedAccessToken = accessToken ? accessToken.split('Bearer%20')[1] || '' : '';
    const strippedRefreshToken = refreshToken ? refreshToken.split('Bearer%20')[1] || '' : '';
    if (accessToken === '' || refreshToken === '' || userId === '') {
      console.log(strippedAccessToken, strippedRefreshToken, userId);
      Swal.fire('Error', '유효하지 않은 접근입니다.', 'error').then(() => {
        navigate('/login', { replace: true });
      });
    } else {
      console.log(userId);
      console.log(strippedAccessToken);
      console.log(strippedRefreshToken);
      console.log(signUp);
      localStorage.setItem('accessToken', strippedAccessToken);
      localStorage.setItem('refreshToken', strippedRefreshToken);
      localStorage.setItem('userId', userId);
      id = localStorage.getItem('userId');

      // 회원가입 성공 알림
      Swal.fire('Success', '회원가입 성공!', 'success').then(() => {
        navigate(`/user/${id}/oauth2/info`);
      });
    }
  }, [URLSearchParams]);

  return (
    <SpinnerOverlay>
      <Spinner />
    </SpinnerOverlay>
  );
};

export default SocialRegisterRedirectUrl;
